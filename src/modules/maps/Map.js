import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {PixelRatio, Platform, Text, View} from 'react-native';

import * as turf from '@turf/turf';
import {Button, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import Basemap from './Basemap';
import useCustomMapHook from './custom-maps/useCustomMap';
import {MAP_MODES} from './maps.constants';
import {setSpotsInMapExtent} from './maps.slice';
import useOfflineMapsHook from './offline-maps/useMapsOffline';
import useMapHook from './useMap';
import useMapCoordsHook from './useMapCoords';
import useMapFeaturesHook from './useMapFeatures';
import useMapFeaturesCalculatedHook from './useMapFeaturesCalculated';
import useMapFeaturesDrawHook from './useMapFeaturesDraw';
import useMapLocationHook from './useMapLocation';
import useMapMeasureHook from './useMapMeasure';
import useMapViewHook from './useMapView';
import {isEmpty} from '../../shared/Helpers';
import IconButton from '../../shared/ui/IconButton';
import {addedStatusMessage, clearedStatusMessages, setErrorMessagesModalVisible} from '../home/home.slice';
import overlayStyles from '../home/overlays/overlay.styles';
import useImagesHook from '../images/useImages';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedOrCreatedSpot, setSelectedSpot} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';

const Map = ({
               cameraRef,
               isSelectingForStereonet,
               isSelectingForTagging,
               mapComponentRef,
               mapRef,
               mapMode,
               onEndDrawPressed,
               setDistance,
               setMapModeToEdit,
             }) => {
  console.log('Rendering Map...');

  const useCustomMap = useCustomMapHook();
  const useImages = useImagesHook();
  const useMap = useMapHook();
  const useMapCoords = useMapCoordsHook();
  const useMapFeatures = useMapFeaturesHook();
  const useMapFeaturesCalculated = useMapFeaturesCalculatedHook(mapRef);
  const useMapFeaturesDraw = useMapFeaturesDrawHook({
    isSelectingForStereonet: isSelectingForStereonet,
    isSelectingForTagging: isSelectingForTagging,
    mapMode: mapMode,
    mapRef: mapRef,
    onEndDrawPressed: onEndDrawPressed,
  });
  const useMapLocation = useMapLocationHook();
  const useMapMeasure = useMapMeasureHook(mapRef);
  const useMapView = useMapViewHook();
  const useOfflineMaps = useOfflineMapsHook();
  const useSpots = useSpotsHook();

  const dispatch = useDispatch();
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const customBasemap = useSelector(state => state.map.customMaps);
  const isOnline = useSelector(state => state.connections.isOnline.isInternetReachable);
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const stratSection = useSelector(state => state.map.stratSection);
  const userEmail = useSelector(state => state.user.email);

  const [basemap, setBasemap] = useState(currentBasemap);
  const [isZoomToCenterOffline, setIsZoomToCenterOffline] = useState(false);
  const [measureFeatures, setMeasureFeatures] = useState([]);
  const [showSetInCurrentViewModal, setShowSetInCurrentViewModal] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);

  useEffect(() => {
    console.log('UE Map [currentImageBasemap]', currentImageBasemap);
    if (currentImageBasemap && (!currentImageBasemap.height || !currentImageBasemap.width)) {
      useImages.setImageHeightAndWidth(currentImageBasemap).catch(console.error);
    }
  }, [currentImageBasemap]);

  useEffect(() => {
    console.log('UE Map [currentBasemap, isZoomToCenterOffline]', currentBasemap, isZoomToCenterOffline);
    updateMapView().catch(err => console.warn('Error getting center of custom map:', err));
  }, [currentBasemap, isZoomToCenterOffline]);

  useEffect(() => {
    console.log('UE Map [userEmail, isOnline]', userEmail, isOnline);
    if (isOnline && !currentBasemap) useMap.setBasemap().catch(console.error);
    else if (isOnline && currentBasemap) {
      console.log('ITS IN THIS ONE!!!! -isOnline && currentBasemap');
      useMap.setBasemap(currentBasemap.id).catch((error) => {
        console.log('Error Setting Basemap', error);
        // Sentry.captureMessage('Something went wrong', error);
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage('Error setting custom basemap.\n Setting basemap Mapbox Topo.' + error));
        dispatch(setErrorMessagesModalVisible(true));
        // useMap.setBasemap();
        // Sentry.captureException(error);
      });
    }
    else if (!isOnline && isOnline !== null && currentBasemap && Platform.OS !== 'web') {
      console.log('ITS IN THIS ONE!!!! -!isOnline && isOnline !== null && currentBasemap');
      Object.values(customBasemap).map((map) => {
        if (offlineMaps[map.id]?.id !== map.id) useCustomMap.setCustomMapSwitchValue(false, map);
      });
      useOfflineMaps.switchToOfflineMap().catch(error => console.log('Error Setting Offline Basemap', error));
    }
    useMapFeaturesDraw.clearVertexes();
  }, [userEmail, isOnline]);

  // Create a default geometry for a Spot that doesn't have geometry when 'Set in Current View' is clicked
  // then make it selected for immediate editing
  const createDefaultGeom = async () => {
    if (selectedSpot && selectedSpot.properties && mapRef && mapRef.current) {
      if (selectedSpot.properties.trace) createDefaultGeomContinued('LineString');
      else if (selectedSpot.properties.surface_feature) createDefaultGeomContinued('Polygon');
      else setShowSetInCurrentViewModal(true);
    }
    else console.warn('Error creating a default geometry as there is no map or Selected Spot');
  };

  const createDefaultGeomContinued = async (defaultGeomType) => {
    let centerCoords = Platform.OS === 'web' ? await mapRef.current.getCenter().toArray()
      : await mapRef.current.getCenter();
    if (centerCoords) {
      let defaultFeature = turf.point(centerCoords);
      if (defaultGeomType === 'LineString' || defaultGeomType === 'Polygon') {
        const centerArea = turf.buffer(defaultFeature, 0.25, {units: 'miles'});
        defaultFeature = turf.bboxPolygon(turf.bbox(centerArea));
        if (defaultGeomType === 'LineString') {
          const defaultFeatureCoords = turf.getCoords(defaultFeature);
          defaultFeature = turf.lineString([defaultFeatureCoords[0][0], defaultFeatureCoords[0][2]]);
        }
      }
      // copy spot for image basemaps needs conversion of coordinates.
      if (currentImageBasemap || stratSection) {
        defaultFeature = useMapCoords.convertFeatureGeometryToImagePixels(defaultFeature);
      }
      const selectedSpotCopy = {...selectedSpot, geometry: defaultFeature.geometry};
      dispatch(updatedModifiedTimestampsBySpotsIds([selectedSpotCopy.properties.id]));
      dispatch(editedOrCreatedSpot(selectedSpotCopy));

      // Set new geometry ready for editing, set the active vertex to first index of the geometry.
      useMapFeaturesDraw.startEditing(selectedSpotCopy, turf.explode(selectedSpotCopy).features[0], 0,
        setMapModeToEdit);
    }
    else console.warn('Error getting the center of the map');
  };

  const endMapMeasurement = () => {
    setDistance(0);
    setMeasureFeatures([]);
  };

  const updateMapView = async () => {
    console.log('Updating map view from Map.js');
    if (!isEmpty(currentBasemap) && isZoomToCenterOffline) {
      const newCenter = await useOfflineMaps.getMapCenterTile(currentBasemap.id);
      const newZoom = 12;
      useMapView.setMapView(newCenter, newZoom);
    }
    setBasemap(currentBasemap);
    setIsZoomToCenterOffline(false);
  };

  const getExtentString = async () => {
    const mapBounds = Platform.OS === 'web' ? await mapRef.current.getBounds().toArray()
      : await mapRef.current.getVisibleBounds();

    let right = mapBounds[0][0];
    let top = mapBounds[0][1];
    let left = mapBounds[1][0];
    let bottom = mapBounds[1][1];
    return left + ',' + bottom + ',' + right + ',' + top;
  };

  const getCurrentZoom = async () => {
    //console.log('Map.current', map);
    return await mapRef.current.getZoom();
    // return 16;
  };

  const getTileCount = async (zoomLevel) => {
    const extentString = await getExtentString();
    try {
      //Assign the promise unresolved first then get the data using the json method.
      console.log('sending this extent to server: ', extentString);
      console.log('sending zoom to server: ', zoomLevel);
      const tileCountApiCall = await fetch(useMap.getExtentAndZoomCall(extentString, zoomLevel));
      const tileCountThisScope = await tileCountApiCall.json();
      console.log('got count from server: ', tileCountThisScope);
      return tileCountThisScope;
    }
    catch (err) {
      console.error(err);
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Error fetching data from tile count service.'));
      dispatch(setErrorMessagesModalVisible(true));
    }
  };

  // Fly the map to the current location
  const goToCurrentLocation = async () => {
    if (cameraRef.current || Platform.OS === 'web') {
      console.log('%cFlying to location', 'color: red');
      const currentLocation = await useMapLocation.getCurrentLocation();
      if (Platform.OS === 'web') {
        mapRef.current.flyTo({center: [currentLocation.longitude, currentLocation.latitude], maxDuration: 2500});
      }
      else await cameraRef.current.flyTo([currentLocation.longitude, currentLocation.latitude], 2500);
    }
    else throw 'Error Getting Map Camera';
  };

  // Handle a long press on the map by making the point or vertex at the point "selected"
  const onMapLongPress = async (e) => {
    console.log('Map long press detected:', e);
    const [screenPointX, screenPointY] = Platform.OS === 'web' ? [e.point.x, e.point.y]
      : Platform.OS === 'android' ? [e.properties.screenPointX / PixelRatio.get(), e.properties.screenPointY / PixelRatio.get()]
        : [e.properties.screenPointX, e.properties.screenPointY];
    const spotToEdit = await useMapFeaturesCalculated.getSpotAtPress(screenPointX, screenPointY);
    const mappedSpots = useMapFeatures.getAllMappedSpots();
    if (mapMode === MAP_MODES.VIEW && !isEmpty(mappedSpots) && !isEmpty(spotToEdit)) {
      await useMapFeaturesDraw.switchToEditing(screenPointX, screenPointY, spotToEdit, setMapModeToEdit);
    }
    else if (mapMode === MAP_MODES.EDIT) await useMapFeaturesDraw.getSpotToEdit(screenPointX, screenPointY, spotToEdit);
    else console.log('No Spots to edit. No action taken.');
  };

  // Mapbox: Handle map press
  const onMapPress = async (e) => {
    console.log('Map press detected:', e);
    console.log('Map mode:', mapMode);
    if (mapMode === MAP_MODES.DRAW.MEASURE) {
      const updatedMeasureFeatures = await useMapMeasure.getMeasureFeatures(e, [...measureFeatures], setDistance);
      setMeasureFeatures(updatedMeasureFeatures);
    }
    else if (mapMode !== MAP_MODES.DRAW.FREEHANDPOLYGON && mapMode !== MAP_MODES.DRAW.FREEHANDLINE) {
      // Select/Unselect a feature
      if (mapMode === MAP_MODES.VIEW) {
        console.log('Selecting or unselect a feature ...');
        const [screenPointX, screenPointY] = Platform.OS === 'web' ? [e.point.x, e.point.y]
          : Platform.OS === 'android' ? [e.properties.screenPointX / PixelRatio.get(), e.properties.screenPointY / PixelRatio.get()]
            : [e.properties.screenPointX, e.properties.screenPointY];
        const spotFound = await useMapFeaturesCalculated.getSpotAtPress(screenPointX, screenPointY);
        if (!isEmpty(spotFound)) dispatch(setSelectedSpot(spotFound));
        else if (stratSection) {
          dispatch(setSelectedSpot(useSpots.getSpotWithThisStratSection(stratSection.strat_section_id)));
        }
        else useMapFeaturesDraw.clearSelectedSpots();
      }
      // Draw a feature
      else if (useMap.isDrawMode(mapMode)) useMapFeaturesDraw.setDrawFeaturesNew(e);
      // Edit a Spot
      else if (mapMode === MAP_MODES.EDIT) await useMapFeaturesDraw.editSpot(e);
      else {
        console.log('Error. Unknown map mode:', mapMode);
      }
    }
  };

  // Modal to prompt the user to select a geometry if no geometry has been set
  const renderSetInCurrentViewModal = () => {
    const buttons = ['Point', 'LineString', 'Polygon'];

    const buttonIcon = (button) => {
      return button === 'LineString' ? require('../../assets/icons/LineButton.png')
        : button === 'Point' ? require('../../assets/icons/PointButton.png')
          : button === 'Polygon' ? require('../../assets/icons/PolygonButton.png')
            : null;
    };

    const updateDefaultGeomType = (geomType) => {
      setShowSetInCurrentViewModal(false);
      createDefaultGeomContinued(geomType);
    };

    return (
      <Overlay
        animationType={'slide'}
        overlayStyle={overlayStyles.overlayContainer}
        isVisible={showSetInCurrentViewModal}
        onBackdropPress={() => {
        }}
      >
        <View style={overlayStyles.titleContainer}>
          <Text style={overlayStyles.titleText}>Select a Geometry Type</Text>
        </View>
        <View style={[overlayStyles.overlayContent, overlayStyles.selectGeometryTypeContent]}>
          {buttons.map(button =>
            <Button
              icon={
                <IconButton
                  style={{paddingRight: 15}}
                  source={buttonIcon(button)}
                  onPress={() => updateDefaultGeomType(button)}
                />
              }
              title={button}
              buttonStyle={overlayStyles.buttonText}
              type={'clear'}
              onPress={() => updateDefaultGeomType(button)}
              key={button}
            />,
          )}
        </View>
      </Overlay>
    );
  };

  const toggleUserLocation = (value) => {
    setShowUserLocation(value);
  };

  // Calculate the Spots in the current map extent and send to redux
  const updateSpotsInMapExtent = async () => {
    if (mapRef && mapRef.current) {
      console.log('Updating spots in map extent...');
      const mapBounds = Platform.OS === 'web' ? await mapRef.current.getBounds().toArray()
        : await mapRef.current.getVisibleBounds();
      let right = mapBounds[0][0];
      let top = mapBounds[0][1];
      let left = mapBounds[1][0];
      let bottom = mapBounds[1][1];
      let bbox = [left, bottom, right, top];
      const bboxPoly = turf.bboxPolygon(bbox);
      const gotSpotsInMapExtent = useMapFeaturesCalculated.getLassoedSpots(
        [...useMapFeaturesDraw.spotsSelected, ...useMapFeaturesDraw.spotsNotSelected], bboxPoly);
      dispatch(setSpotsInMapExtent(gotSpotsInMapExtent));
    }
  };

  const zoomToCenterOfflineTile = () => {
    setIsZoomToCenterOffline(true);
  };

  const zoomToCustomMap = (bbox, duration) => {
    const animationDuration = duration;
    if (bbox) {
      const bboxArr = bbox.split(',');
      if (Platform.OS === 'web') {
        mapRef.current?.fitBounds([[Number(bboxArr[0]), Number(bboxArr[1])], [Number(bboxArr[2]), Number(bboxArr[3])]],
          {padding: 100, duration: animationDuration || 1500});
      }
      else {
        cameraRef.current.fitBounds([Number(bboxArr[0]), Number(bboxArr[1])], [Number(bboxArr[2]), Number(bboxArr[3])],
          100, animationDuration || 1500);
      }
    }
    else {
      console.error('Error: not able to get Custom Map bbox coords...');
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Not able to zoom to custom map while offline.'));
      dispatch(setErrorMessagesModalVisible(true));
    }
  };

  const zoomToSpots = (spotsToZoomTo) => {
    useMapView.zoomToSpots(spotsToZoomTo, mapRef.current, cameraRef.current);
  };

  // Zoom map to the extent of the mapped Spots
  const zoomToSpotsExtent = () => {
    const spotsToZoomTo = [...useMapFeaturesDraw.spotsSelected, ...useMapFeaturesDraw.spotsNotSelected];
    useMapView.zoomToSpots(spotsToZoomTo, mapRef.current, cameraRef.current);
  };

  useImperativeHandle(mapComponentRef, () => {
    return {
      cancelDraw: useMapFeaturesDraw.cancelDraw,
      cancelEdits: useMapFeaturesDraw.cancelEdits,
      clearSelectedSpots: useMapFeaturesDraw.clearSelectedSpots,
      createDefaultGeom: createDefaultGeom,
      endDraw: useMapFeaturesDraw.endDraw,
      endMapMeasurement: endMapMeasurement,
      getCurrentZoom: getCurrentZoom,
      getExtentString: getExtentString,
      getTileCount: getTileCount,
      goToCurrentLocation: goToCurrentLocation,
      moveVertex: useMapFeaturesDraw.moveVertex,
      saveEdits: useMapFeaturesDraw.saveEdits,
      toggleUserLocation: toggleUserLocation,
      updateSpotsInMapExtent: updateSpotsInMapExtent,
      zoomToCenterOfflineTile: zoomToCenterOfflineTile,
      zoomToCustomMap: zoomToCustomMap,
      zoomToSpots: zoomToSpots,
      zoomToSpotsExtent: zoomToSpotsExtent,
    };
  });

  return (
    <>
      {basemap && (
        <Basemap
          allowMapViewMove={useMapFeaturesDraw.allowMapViewMove}
          basemap={basemap}
          drawFeatures={useMapFeaturesDraw.drawFeatures}
          editFeatureVertex={useMapFeaturesDraw.editFeatureVertex}
          mapMode={mapMode}
          measureFeatures={measureFeatures}
          onMapLongPress={onMapLongPress}
          onMapPress={onMapPress}
          ref={{mapRef: mapRef, cameraRef: cameraRef}}
          showUserLocation={showUserLocation}
          spotsNotSelected={useMapFeaturesDraw.spotsNotSelected}
          spotsSelected={useMapFeaturesDraw.spotsSelected}
        />
      )}
      {renderSetInCurrentViewModal()}
    </>
  );
};

export default Map;
