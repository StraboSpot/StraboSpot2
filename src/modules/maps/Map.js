import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {PixelRatio, Platform, Text, View} from 'react-native';

import * as turf from '@turf/turf';
import proj4 from 'proj4';
import {Button, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import Basemap from './Basemaps';
import {GEO_LAT_LNG_PROJECTION, MAP_MODES, PIXEL_PROJECTION} from './maps.constants';
import {clearedVertexes, setFreehandFeatureCoords, setSpotsInMapExtent, setVertexStartCoords} from './maps.slice';
import useOfflineMapsHook from './offline-maps/useMapsOffline';
import useMapSymbology from './symbology/useMapSymbology';
import useLocationHook from './useLocation';
import useMapFeaturesHook from './useMapFeatures';
import useMapsHook from './useMaps';
import useMapViewHook from './useMapView';
import VertexDrag from './VertexDrag';
import {getNewUUID, isEmpty} from '../../shared/Helpers';
import alert from '../../shared/ui/alert';
import IconButton from '../../shared/ui/IconButton';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setErrorMessagesModalVisible,
  setModalVisible,
} from '../home/home.slice';
import overlayStyles from '../home/overlays/overlay.styles';
import useImagesHook from '../images/useImages';
import {MODAL_KEYS} from '../page/page.constants';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {
  clearedSelectedSpots,
  editedOrCreatedSpot,
  editedSpots,
  setIntersectedSpotsForTagging,
  setSelectedSpot,
} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';

const Map = ({
               isSelectingForStereonet,
               isSelectingForTagging,
               mapComponentRef,
               mapMode,
               onEndDrawPressed,
               setDistance,
               startEdit,
             }, forwardedRef) => {
  console.log('Rendering Map...');

  const dispatch = useDispatch();

  const [useImages] = useImagesHook();
  const [useMapFeatures] = useMapFeaturesHook();
  const [useSpots] = useSpotsHook();
  const [useSymbology] = useMapSymbology();
  const useLocation = useLocationHook();
  const useMapView = useMapViewHook();
  const useOfflineMaps = useOfflineMapsHook();

  const center = useSelector(state => state.map.center);
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const customBasemap = useSelector(state => state.map.customMaps);
  const stratSection = useSelector(state => state.map.stratSection);
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const vertexEndCoords = useSelector(state => state.map.vertexEndCoords);
  const spots = useSelector(state => state.spot.spots);
  const freehandFeatureCoords = useSelector(state => state.map.freehandFeatureCoords);
  const datasets = useSelector(state => state.project.datasets);
  const selectedSymbols = useSelector(state => state.map.symbolsOn) || [];
  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const isOnline = useSelector(state => state.connections.isOnline);
  const user = useSelector(state => state.user);

  // Data needing to be tracked when in editing mode
  const initialEditingModeData = {
    spotEditing: {},
    spotsEdited: [],
    spotsNotEdited: [],
    vertexToEdit: [],
    vertexIndex: [],
  };

  const vertexStartCoords = useSelector(state => state.map.vertexStartCoords);

  // Props that change that needed to pass to the map component
  const initialMapPropsMutable = {
    allowMapViewMove: true,
    basemap: currentBasemap,
    centerCoordinate: center,
    drawFeatures: [],
    editFeatureVertex: [],
    imageBasemap: currentImageBasemap,
    spotsNotSelected: [],
    spotsSelected: [],
    showUserLocation: false,
    freehandSketchMode: false,
    measureFeatures: [],
  };

  const [editingModeData, setEditingModeData] = useState(initialEditingModeData);
  const [mapPropsMutable, setMapPropsMutable] = useState(initialMapPropsMutable);
  const [showSetInCurrentViewModal, setShowSetInCurrentViewModal] = useState(false);
  const [defaultGeomType, setDefaultGeomType] = useState();
  const [isZoomToCenterOffline, setIsZoomToCenterOffline] = useState(false);

  const mapRef = useRef(null);
  const cameraRef = useRef(null);

  const [useMaps] = useMapsHook(mapRef);

  // Props that needed to pass to the map component
  const mapProps = {
    ...mapPropsMutable,
    freehandSketchMode: (mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON
      || mapMode === MAP_MODES.DRAW.FREEHANDLINE),
    allowMapViewMove: !useMaps.isDrawMode(mapMode) && mapMode !== MAP_MODES.EDIT,
    ref: {mapRef: mapRef, cameraRef: cameraRef},
    onMapPress: e => onMapPress(e),
    onMapLongPress: e => onMapLongPress(e),
    updateSpotsInMapExtent: () => updateSpotsInMapExtent(),
    mapMode: mapMode,
  };

  useEffect(() => {
    console.log('UE Map [currentImageBasemap]', currentImageBasemap);
    if (currentImageBasemap && (!currentImageBasemap.height || !currentImageBasemap.width)) {
      useImages.setImageHeightAndWidth(currentImageBasemap).catch(console.error);
    }
    else {
      setMapPropsMutable(m => ({
        ...m,
        imageBasemap: currentImageBasemap,
        stratSection: currentImageBasemap ? undefined : m.stratSection,
      }));
    }
  }, [currentImageBasemap]);

  useEffect(() => {
    console.log('UE Map [stratSection]', stratSection);
    setMapPropsMutable(m => ({
      ...m,
      imageBasemap: stratSection ? undefined : m.imageBasemap,
      stratSection: stratSection,
    }));
  }, [stratSection]);

  useEffect(() => {
    console.log('UE Map [currentBasemap, isZoomToCenterOffline]', currentBasemap, isZoomToCenterOffline);
    updateMapView().catch(err => console.warn('Error getting center of custom map:', err));
  }, [currentBasemap, isZoomToCenterOffline]);

  useEffect(() => {
    console.log('UE Map [user, isOnline]', user, isOnline);
    if (isOnline.isInternetReachable && !currentBasemap) useMaps.setBasemap().catch(console.error);
    else if (isOnline.isInternetReachable && currentBasemap) {
      console.log('ITS IN THIS ONE!!!! -isOnline && currentBasemap');
      useMaps.setBasemap(currentBasemap.id).catch((error) => {
        console.log('Error Setting Basemap', error);
        // Sentry.captureMessage('Something went wrong', error);
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage('Error setting custom basemap.\n Setting basemap Mapbox Topo.' + error));
        dispatch(setErrorMessagesModalVisible(true));
        // useMaps.setBasemap();
        // Sentry.captureException(error);
      });
    }
    else if (!isEmpty(isOnline) && !isOnline.isInternetReachable && isOnline.isInternetReachable !== null
      && currentBasemap) {
      console.log('ITS IN THIS ONE!!!! -!isOnline && isOnline !== null && currentBasemap');
      Object.values(customBasemap).map((map) => {
        if (offlineMaps[map.id]?.id !== map.id) useMaps.setCustomMapSwitchValue(false, map);
      });
      useOfflineMaps.switchToOfflineMap().catch(error => console.log('Error Setting Offline Basemap', error));
    }
    clearVertexes();
  }, [user, isOnline]);

  useEffect(() => {
    console.log(
      'UE Map [spots, datasets, currentBasemap, currentImageBasemap, selectedSymbols, isAllSymbolsOn, stratSection]',
      spots, datasets, currentBasemap, currentImageBasemap, selectedSymbols, isAllSymbolsOn, stratSection);
    setDisplayedSpots((isEmpty(selectedSpot) ? [] : [{...selectedSpot}]));
  }, [spots, datasets, currentBasemap, currentImageBasemap, selectedSymbols, isAllSymbolsOn, stratSection]);

  useEffect(() => {
    console.log('UE Map [selectedSpot, activeDatasetsIds]', selectedSpot, activeDatasetsIds);
    //conditional call to avoid multiple renders during edit mode.
    if (mapMode !== MAP_MODES.EDIT) {
      setDisplayedSpots((isEmpty(selectedSpot) ? [] : [{...selectedSpot}]));
    }
  }, [selectedSpot, activeDatasetsIds]);

  useEffect(() => {
    console.log('UE Map [vertexEndCoords]', vertexEndCoords);
    if (!isEmpty(vertexEndCoords && mapMode === MAP_MODES.EDIT)) moveVertex();
  }, [vertexEndCoords]);

  useEffect(() => {
    console.log('UE Map [mapPropsMutable.drawFeatures]', mapPropsMutable.drawFeatures);
    if (mapMode === MAP_MODES.DRAW.POINT && mapPropsMutable.drawFeatures.length === 1) onEndDrawPressed();
  }, [mapPropsMutable.drawFeatures]);

  useEffect(() => {
    console.log('UE Map [defaultGeomType]', defaultGeomType);
    if (defaultGeomType) createDefaultGeomContinued();
  }, [defaultGeomType]);

  const clearVertexes = () => {
    dispatch(clearedVertexes());
  };

  // Create a default geometry for a Spot that doesn't have geometry when 'Set in Current View' is clicked
  // then make it selected for immediate editing
  const createDefaultGeom = async () => {
    if (selectedSpot && selectedSpot.properties && mapRef && mapRef.current) {
      if (selectedSpot.properties.trace) setDefaultGeomType('LineString');
      else if (selectedSpot.properties.surface_feature) setDefaultGeomType('Polygon');
      else setShowSetInCurrentViewModal(true);
    }
    else console.warn('Error creating a default geometry as there is no map or Selected Spot');
  };

  const createDefaultGeomContinued = async () => {
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
        defaultFeature = useMaps.convertFeatureGeometryToImagePixels(defaultFeature);
      }
      const selectedSpotCopy = {
        ...selectedSpot,
        geometry: defaultFeature.geometry,
      };
      dispatch(updatedModifiedTimestampsBySpotsIds([selectedSpotCopy.properties.id]));
      dispatch(editedOrCreatedSpot(selectedSpotCopy));

      // Set new geometry ready for editing, set the active vertex to first index of the geometry.
      startEditing(selectedSpotCopy, turf.explode(selectedSpotCopy).features[0], 0);
    }
    else console.warn('Error getting the center of the map');
    setDefaultGeomType();
  };

  const endMapMeasurement = () => {
    setDistance(0);
    setMapPropsMutable(m => ({
      ...m,
      measureFeatures: [],
    }));
  };

  const updateMapView = async () => {
    console.log('Updating map view from Map.js');
    if (!isEmpty(currentBasemap) && isZoomToCenterOffline) {
      const newCenter = await useOfflineMaps.getMapCenterTile(currentBasemap.id);
      const newZoom = 12;
      useMapView.setMapView(newCenter, newZoom);
    }
    setMapPropsMutable(m => ({
      ...m,
      basemap: currentBasemap,
    }));
    setIsZoomToCenterOffline(false);
  };

  const moveVertex = async () => {
    try { // on imagebasemap, if spot is not point, conversion happens in editSpotCoordinates.
      const newVertexCoords = Platform.OS === 'web' ? mapRef.current.unproject(vertexEndCoords).toArray()
        : await mapRef.current.getCoordinateFromView(vertexEndCoords);
      if ((currentImageBasemap || stratSection) && editingModeData.spotEditing
        && turf.getType(editingModeData.spotEditing) === 'Point') {
        const vertexCoordinates = proj4(GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION,
          [newVertexCoords[0], newVertexCoords[1]]);
        console.log('Move vertex to:', vertexCoordinates);
        editSpotCoordinates([vertexCoordinates[0], vertexCoordinates[1]]);
      }
      else {
        console.log('Move vertex to:', newVertexCoords);
        editSpotCoordinates(newVertexCoords);
      }
    }
    catch {
      console.log('Problem moving the vertex');
    }
  };

  // Set selected and not selected Spots to display when not editing
  const setDisplayedSpots = (selectedSpots) => {
    let [selectedDisplayedSpots, notSelectedDisplayedSpots] = useMaps.getDisplayedSpots(selectedSpots);
    if (currentImageBasemap || stratSection) {
      // convert the image pixels to lat, lng before we display them
      let selectedMappableSpotsCopy = JSON.parse(JSON.stringify(selectedDisplayedSpots));
      let notSelectedMappableSpotsCopy = JSON.parse(JSON.stringify(notSelectedDisplayedSpots));
      selectedMappableSpotsCopy = selectedMappableSpotsCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      notSelectedMappableSpotsCopy = notSelectedMappableSpotsCopy.map(
        spot => useMaps.convertImagePixelsToLatLong(spot));
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: [...selectedMappableSpotsCopy],
        spotsNotSelected: [...notSelectedMappableSpotsCopy],
      }));
    }
    else {
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: [...selectedDisplayedSpots],
        spotsNotSelected: [...notSelectedDisplayedSpots],
      }));
    }
  };

  // Set selected and not selected Spots to display while editing
  const setDisplayedSpotsWhileEditing = (spotEditingTmp, spotsEditedTmp, spotsNotEditedTmp) => {
    if (!isEmpty(spotEditingTmp)) {
      spotsNotEditedTmp = spotsNotEditedTmp.filter(spot => spot.properties.id !== spotEditingTmp.properties.id);
    }
    console.log('Set displayed Spots while editing. Editing:', spotEditingTmp, 'Edited:', spotsEditedTmp, 'Not edited:',
      spotsNotEditedTmp);
    if (!currentImageBasemap && !stratSection) {
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: isEmpty(spotEditingTmp) ? [] : [{...spotEditingTmp}],
        spotsNotSelected: [...spotsEditedTmp, ...spotsNotEditedTmp],
      }));
    }
    else { // if imagebasemap, then all the coordinates have to be converted.
      let spotsEditedCopy = JSON.parse(JSON.stringify(isEmpty(spotsEditedTmp) ? [] : spotsEditedTmp));
      let spotsNotEditedCopy = JSON.parse(JSON.stringify(isEmpty(spotsNotEditedTmp) ? [] : spotsNotEditedTmp));
      let spotEditingCopy = JSON.parse(JSON.stringify(isEmpty(spotEditingTmp) ? [] : [{...spotEditingTmp}]));
      spotsEditedCopy = spotsEditedCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      spotsNotEditedCopy = spotsNotEditedCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      spotEditingCopy = spotEditingCopy.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      setMapPropsMutable(m => ({
        ...m,
        spotsSelected: isEmpty(spotEditingCopy) ? [] : spotEditingCopy,
        spotsNotSelected: [...spotsEditedCopy, ...spotsNotEditedCopy],
      }));
    }
  };

  const setDrawFeatures = (features) => {
    console.log('Set draw features:', features);
    setMapPropsMutable(m => ({
      ...m,
      drawFeatures: features,
    }));
  };

  const setEditFeatures = (spotToEdit) => {
    // Get the draw features for the Spot (the individual vertex and lines that make up the Spot)
    let explodedFeatures = turf.explode(spotToEdit).features;
    // If polygon remove last exploded point because it is the same as the first
    if (turf.getType(spotToEdit) === 'Polygon') explodedFeatures.pop();
    explodedFeatures = explodedFeatures.map((feature) => {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          tempEditId: getNewUUID(),
        },
      };
    });
    if (currentImageBasemap || stratSection) { // if imagebasemap, features, need to be converted to getLatLng inOrder to project them.
      if (turf.getType(spotToEdit) === 'Polygon' || turf.getType(spotToEdit) === 'LineString') {
        explodedFeatures = explodedFeatures.map(spot => useMaps.convertImagePixelsToLatLong(spot));
      }
    }
    setDrawFeatures(explodedFeatures);
  };

  const clearSelectedSpots = () => {
    console.log('Clear selected Spots.');
    setDisplayedSpots([]);
    dispatch(clearedSelectedSpots());
  };

  const clearSelectedSpotsWhileEditing = () => {
    console.log('Clear selected Spots.');
    setDisplayedSpotsWhileEditing([], editingModeData.spotsEdited, editingModeData.spotsNotEdited);
    dispatch(clearedSelectedSpots());
  };

  // Mapbox: Handle map press
  const onMapPress = async (e) => {
    console.log('Map press detected:', e);
    console.log('Map mode:', mapMode);
    if (mapMode === MAP_MODES.DRAW.MEASURE) {
      const updatedMeasureFeatures = await useMaps.getMeasureFeatures(e, [...mapProps.measureFeatures],
        setDistance);
      setMapPropsMutable(m => ({...m, measureFeatures: updatedMeasureFeatures}));
    }
    else if (mapMode !== MAP_MODES.DRAW.FREEHANDPOLYGON && mapMode !== MAP_MODES.DRAW.FREEHANDLINE) {
      // Select/Unselect a feature
      if (mapMode === MAP_MODES.VIEW) {
        console.log('Selecting or unselect a feature ...');
        const [screenPointX, screenPointY] = Platform.OS === 'web' ? [e.point.x, e.point.y]
          : Platform.OS === 'android' ? [e.properties.screenPointX / PixelRatio.get(), e.properties.screenPointY / PixelRatio.get()]
            : [e.properties.screenPointX, e.properties.screenPointY];
        const spotFound = await useMaps.getSpotAtPress(screenPointX, screenPointY);
        if (!isEmpty(spotFound)) dispatch(setSelectedSpot(spotFound));
        else if (stratSection) {
          dispatch(setSelectedSpot(useSpots.getSpotWithThisStratSection(stratSection.strat_section_id)));
        }
        else clearSelectedSpots();
      }
      // Draw a feature
      else if (useMaps.isDrawMode(mapMode)) {
        console.log('Drawing', mapMode, '...');
        let feature = {};
        const newCoord = Platform.OS === 'web' ? [e.lngLat.lng, e.lngLat.lat] : turf.getCoord(e);
        // Draw a point for the last coordinate touched
        // const lastVertexPlaced = MapboxGL.geoUtils.makeFeature(e.geometry);
        const lastVertexPlaced = turf.point(newCoord);
        // Draw a point (if set point to current location not working)
        if (mapMode === MAP_MODES.DRAW.POINT) setDrawFeatures([lastVertexPlaced]);
        else if (isEmpty(mapPropsMutable.drawFeatures)) setDrawFeatures([lastVertexPlaced]);
        // Draw a line given a point and a new point
        else if (mapPropsMutable.drawFeatures.length === 1) {
          const firstVertexPlaced = mapPropsMutable.drawFeatures[0];
          const firstVertexPlacedCoords = turf.getCoords(firstVertexPlaced);
          feature = turf.lineString([firstVertexPlacedCoords, newCoord]);
          setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
        }
        // Draw a line given a line and a new point
        else if (mapPropsMutable.drawFeatures.length > 1 && mapMode === MAP_MODES.DRAW.LINE) {
          const firstVertexPlaced = mapPropsMutable.drawFeatures[0];
          const lineCoords = turf.getCoords(mapPropsMutable.drawFeatures[1]);
          feature = turf.lineString([...lineCoords, newCoord]);
          setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
        }
        else if (mapPropsMutable.drawFeatures.length > 1 && mapMode === MAP_MODES.DRAW.POLYGON) {
          const firstVertexPlaced = mapPropsMutable.drawFeatures[0];
          const firstVertexPlacedCoords = turf.getCoords(firstVertexPlaced);

          // Draw a polygon given a line and a new point
          if (turf.getType(mapPropsMutable.drawFeatures[1]) === 'LineString') {
            const lineCoords = turf.getCoords(mapPropsMutable.drawFeatures[1]);
            feature = turf.polygon([[...lineCoords, newCoord, firstVertexPlacedCoords]]);
          }
          // Draw a polygon given a polygon and a new point
          else {
            let polyCoords = turf.getCoords(mapPropsMutable.drawFeatures[1])[0];
            polyCoords.pop();
            feature = turf.polygon([[...polyCoords, newCoord, firstVertexPlacedCoords]]);
          }
          setDrawFeatures([firstVertexPlaced, feature, lastVertexPlaced]);
        }
      }
      // Edit a Spot
      else if (mapMode === MAP_MODES.EDIT) {
        // Select/Unselect new vertex to edit
        const [screenPointX, screenPointY] = Platform.OS === 'web' ? [e.point.x, e.point.y]
          : Platform.OS === 'android' ? [e.properties.screenPointX / PixelRatio.get(), e.properties.screenPointY / PixelRatio.get()]
            : [e.properties.screenPointX, e.properties.screenPointY];
        console.log('Select/Unselect vertex (and thus feature with the vertex) to edit');
        console.log('Selecting feature to edit...');

        // If we don't have a selected feature, check to see if point pressed was at a feature
        //   If not, do nothing
        //   If so, set that feature to the selected feature and set all other features as features-not-selected and
        //   explode the vertices of the selected feature if the feature is a line or polygon and add to draw layer
        // If we already have a selected feature check to see if we also already have a selected vertex
        // If not, and there is a different feature at the point pressed, set that feature as the selected feature
        // If not, and there is a vertex of the selected feature at the point pressed, set that as the selected vertex
        // If not, and there is no feature at the point pressed, unselect the selected feature
        // If so, check to see if point pressed was at another vertex of the selected feature
        //     If not edit vertex coords to those of pressed point
        //     If so switch selected vertex to vertex at pressed point
        const spotFound = await useMaps.getSpotAtPress(screenPointX, screenPointY);
        // #114, while editing, click on a different spot to edit, should immediately identify it as the selected spot and hence update the notebook panel.
        if (!isEmpty(spotFound)) dispatch(setSelectedSpot(spotFound));
        if (isEmpty(editingModeData.spotEditing)) {
          if (isEmpty(spotFound)) console.log('No feature selected.');
          else setSelectedSpotToEdit(spotFound);
        }
        else {
          let closestVertexDetails = {};
          let isVertexIdentifiedAtSpotPress = false;
          if (isEmpty(spotFound)) clearSelectedFeatureToEdit();
          else {
            let vertexSelected = await useMaps.getDrawFeatureAtPress(screenPointX, screenPointY);
            if (!isEmpty(vertexSelected)) {
              // When draw features identifies a vertex that is not on the spot found, mark it undefined so that,
              // we can calculate a vertex on the spot found that is closest to the press.
              if (spotFound.properties.id !== vertexSelected.properties.id) vertexSelected = undefined;
            }
            if (isEmpty(vertexSelected)) {
              // draw features did not return anything - generally a scenario of selecting a vertex on a spot press.
              closestVertexDetails = await useMaps.identifyClosestVertexOnSpotPress(spotFound, screenPointX,
                screenPointY, editingModeData);
              vertexSelected = closestVertexDetails[0];
              isVertexIdentifiedAtSpotPress = true;
            }
            if (isEmpty(vertexSelected)) {
              if (editingModeData.spotEditing.properties.id === spotFound.properties.id) clearSelectedFeatureToEdit();
              else {
                //if the spot is in already edited list, then get the spot from that list.
                let editedSpot = editingModeData.spotsEdited.find(
                  spot => spot.properties.id === spotFound.properties.id);
                setSelectedSpotToEdit(isEmpty(editedSpot) ? spotFound : editedSpot);
              }
            }
            else {
              //if the vertex is not empty, check if it's identified at spot press or vertex press
              if (isVertexIdentifiedAtSpotPress) {
                //  this is the case when the spot and vertex are chosen to be edited at once.
                let editedSpot = editingModeData.spotsEdited.find(
                  spot => spot.properties.id === spotFound.properties.id);
                setSelectedSpotToEdit(isEmpty(editedSpot) ? spotFound : editedSpot);
                if (spotFound.geometry.type !== 'Point') { // if Point, vertex gets set by setSelectedSpotToEdit already.
                  setSelectedVertexToEdit(vertexSelected);
                  setEditingModeData(d => ({
                    ...d,
                    vertexIndex: closestVertexDetails[1],
                  }));
                }
              }
              else setSelectedVertexToEdit(vertexSelected);
              // this is the case when the spot is already highlighted for edit and a vertex is chosen to edit.
            }
          }
        }
      }
      else {
        console.log('Error. Unknown map mode:', mapMode);
      }
    }
  };

  const setSelectedSpotToEdit = (spotToEdit) => {
    console.log('setSelectedSpotToEdit spotToEdit', spotToEdit);
    setEditingModeData(d => ({
      ...d,
      spotEditing: spotToEdit,
    }));
    console.log('Set Spot to edit:', spotToEdit);
    setDisplayedSpotsWhileEditing(spotToEdit, editingModeData.spotsEdited, editingModeData.spotsNotEdited);
    setEditFeatures(spotToEdit);
    if (turf.getType(spotToEdit) === 'Point') setSelectedVertexToEdit(spotToEdit);
  };

  const clearSelectedFeatureToEdit = () => {
    console.log('Clearing selected Spot.');
    clearSelectedSpotsWhileEditing();
    setDrawFeatures([]);
    clearSelectedVertexToEdit();                        // Not really needed here?
    console.log('Cleared selected Spot.');
  };

  const setSelectedVertexToEdit = async (vertex) => {
    console.log('setSelectedVertexToEdit, vertex:', vertex);
    clearVertexes();
    setEditingModeData(d => ({
      ...d,
      vertexToEdit: vertex,
      vertexIndex: undefined,
    }));
    console.log('Set vertex to edit:', vertex);
    setMapPropsMutable(m => ({
      ...m,
      editFeatureVertex: [vertex],
      allowMapViewMove: false,
    }));
    let vertexGeoCoords = vertex.geometry.coordinates;
    if ((currentImageBasemap || stratSection)
      && ((isEmpty(editingModeData.spotEditing) || ((!isEmpty(editingModeData.spotEditing)
        && editingModeData.spotEditing.geometry.type === 'Point')) || (!isEmpty(editingModeData.spotEditing)
        && editingModeData.spotEditing.properties.name !== vertex.properties.name)))) {
      // spotEditing will be empty for Point (may not be empty if the same spot is selected again for edit) and
      // not empty for polygon or linestring, because, only Point can select the vertex on first long press.
      // For polygon or line, long press would identify the spot.
      // For polygon or LineString, the vertex comes from the draw feature, so, the coordinates are already in lat lng projection, so no more conversion necessary.

      // !isEmpty(editingModeData.spotEditing) && editingModeData.spotEditing.properties.name != vertex.properties.name)), this check is required
      // when a polygon/linestring is selected by a long press first then a different point than the points on polygon/line is selected to edit.
      vertexGeoCoords = proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION, vertexGeoCoords);
    }
    let vertexScreenCoords = Platform.OS === 'web' ? mapRef.current.project(vertexGeoCoords)
      : await mapRef.current.getPointInView(vertexGeoCoords);
    if (Platform.OS === 'web') vertexScreenCoords = [vertexScreenCoords.x, vertexScreenCoords.y];
    else if (Platform.OS === 'android') {
      vertexScreenCoords = [vertexScreenCoords[0] / PixelRatio.get(), vertexScreenCoords[1] / PixelRatio.get()];
    }
    dispatch(setVertexStartCoords(vertexScreenCoords));
  };

  const clearSelectedVertexToEdit = () => {
    setEditingModeData(d => ({
      ...d,
      vertexToEdit: {},
    }));
    setMapPropsMutable(m => ({
      ...m,
      editFeatureVertex: [],
      allowMapViewMove: true,
    }));
    console.log('Cleared selected vertex to edit.');
    //if (turf.getType(spotsEditing[0]) === 'Point') clearSelectedFeatureToEdit();
    clearVertexes();
  };

  // Identify the vertex which has to be updated
  const getVertexIndexInSpotToEdit = (vertex) => {
    if (isEmpty(vertex)) {
      return {};
    }
    let indexOfCoordinatesToUpdate = [];
    for (let index = 0; index < mapPropsMutable.drawFeatures.length; index++) {
      if (mapPropsMutable.drawFeatures[index].properties.tempEditId === vertex.properties.tempEditId) {
        indexOfCoordinatesToUpdate.push(index);
      }
    }
    return indexOfCoordinatesToUpdate;
  };

  // Edit the coordinates of a selected feature
  const editSpotCoordinates = (newCoord) => {
    console.log('In editSpotCoordinates', newCoord);
    if (isEmpty(editingModeData.spotEditing)) console.log('No Spot to edit selected');
    else {
      if (!editingModeData.vertexToEdit) console.log('No vertex to edit selected');
      else {
        console.log('Editing Coordinate');
        let spotEditingCopy = JSON.parse(JSON.stringify(editingModeData.spotEditing));
        console.log('Feature Editing:', spotEditingCopy);
        let coords;
        try {
          coords = turf.getCoords(spotEditingCopy);
        }
        catch {
          console.warn('error use getCoords on spotEditingCopy', spotEditingCopy);
          coords = spotEditingCopy.geometry.coordinates;
        }
        let isModified = false;
        if (turf.getType(spotEditingCopy) === 'Point') {
          spotEditingCopy.geometry.coordinates = newCoord;
          isModified = true;
        }
          // identify the coordinates to edit, uses the tempEditId on drawFeatures and vertex to edit.
          // the index on drawFeatures array that matches with vertex to edit is the index of the coordinates to be edited
        // on the actual polygon or linestring.
        else {
          let indexOfCoordinatesToUpdate = getVertexIndexInSpotToEdit(editingModeData.vertexToEdit);
          if (!isEmpty(indexOfCoordinatesToUpdate)) {
            if (indexOfCoordinatesToUpdate.includes(0)) {
              setEditingModeData(d => ({
                ...d,
                vertexIndex: 0,
              }));
            }
            else {
              setEditingModeData(d => ({
                ...d,
                vertexIndex: indexOfCoordinatesToUpdate,
              }));
            }
          }
          if (currentImageBasemap || stratSection) newCoord = proj4(GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION, newCoord);
          if (turf.getType(spotEditingCopy) === 'LineString') {
            if (!isEmpty(editingModeData.vertexIndex)) {
              spotEditingCopy.geometry.coordinates[editingModeData.vertexIndex] = newCoord;
            }
            else {
              for (let j = 0; j < coords.length; j++) {
                if (indexOfCoordinatesToUpdate.includes(j)) {
                  spotEditingCopy.geometry.coordinates[j] = newCoord;
                }
              }
            }
            isModified = true;
          }
          else if (turf.getType(spotEditingCopy) === 'Polygon') {
            if (!isEmpty(editingModeData.vertexIndex)) {
              spotEditingCopy.geometry.coordinates[0][editingModeData.vertexIndex] = newCoord;
              if (editingModeData.vertexIndex === 0) {
                spotEditingCopy.geometry.coordinates[0][mapPropsMutable.drawFeatures.length] = newCoord;
              }
              else if (editingModeData.vertexIndex === mapPropsMutable.drawFeatures.length) {
                spotEditingCopy.geometry.coordinates[0][0] = newCoord;
              }
              isModified = true;
            }
            else {
              if (indexOfCoordinatesToUpdate.includes(0)) {
                indexOfCoordinatesToUpdate.push(mapPropsMutable.drawFeatures.length);
                // if its first index, that needs to be edited, for a polygon, the last and first coordinates
                //point to the same one, so both should be updated.
              }
              for (let i = 0; i < coords.length; i++) {
                for (let j = 0; j < coords[i].length; j++) {
                  if (indexOfCoordinatesToUpdate.includes(j)) {
                    spotEditingCopy.geometry.coordinates[i][j] = newCoord;
                    isModified = true;
                  }
                }
              }
            }
          }
        }
        if (isModified) {
          spotEditingCopy.properties.modified_timestamp = Date.now();
          console.log('Finished editing Spot. Edited Spot:', spotEditingCopy, 'mapProps.spotsSelected',
            mapProps.spotsSelected);
        }
        else console.warn('Problem editing Spot');
        console.log('Edited coords:', turf.getCoords(spotEditingCopy));
        let explodedFeatures = turf.explode(spotEditingCopy).features;
        // If polygon remove last exploded point because it is the same as the first
        if (turf.getType(spotEditingCopy) === 'Polygon') explodedFeatures.pop();
        explodedFeatures = explodedFeatures.map((feature) => {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              tempEditId: getNewUUID(),
            },
          };
        });
        if (currentImageBasemap || stratSection) { // if imagebasemap, features, need to be converted to getLatLng inOrder to project them.
          if (turf.getType(spotEditingCopy) === 'Polygon' || turf.getType(spotEditingCopy) === 'LineString') {
            explodedFeatures = explodedFeatures.map(spot => useMaps.convertImagePixelsToLatLong(spot));
          }
        }
        setDrawFeatures(explodedFeatures);
        const spotsEditedTmp = editingModeData.spotsEdited.filter(
          spotEdited => spotEdited.properties.id !== spotEditingCopy.properties.id);
        spotsEditedTmp.push(spotEditingCopy);
        const spotsNotEditedTmp = editingModeData.spotsNotEdited.filter(
          spotNotEdited => spotNotEdited.properties.id !== spotEditingCopy.properties.id);
        setEditingModeData(d => ({
          ...d,
          spotEditing: spotEditingCopy,
          spotsEdited: spotsEditedTmp,
          spotsNotEdited: spotsNotEditedTmp,
        }));
        setDisplayedSpotsWhileEditing(spotEditingCopy, spotsEditedTmp, spotsNotEditedTmp);
        setMapPropsMutable(m => ({
          // this clears the initial feature vertex that is selected.
          ...m,
          editFeatureVertex: [],
        }));
        console.log('Finished editing Spot. Spot Editing: ', spotEditingCopy);
      }
    }
  };

  const getCurrentBasemap = () => {
    return currentBasemap;
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
      const tileCountApiCall = await fetch(useMaps.getExtentAndZoomCall(extentString, zoomLevel));
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
      const currentLocation = await useLocation.getCurrentLocation();
      if (Platform.OS === 'web') {
        mapRef.current.flyTo({center: [currentLocation.longitude, currentLocation.latitude], maxDuration: 2500});
      }
      else await cameraRef.current.flyTo([currentLocation.longitude, currentLocation.latitude], 2500);
    }
    else throw 'Error Getting Map Camera';
  };

  const endDraw = async () => {
    // console.log('endDraw mapProps', mapProps); // Commented out because it throws an error about circular structure in JSON
    let newOrEditedSpot = {};
    if (mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON || mapMode === MAP_MODES.DRAW.FREEHANDLINE) {
      if (freehandFeatureCoords && freehandFeatureCoords.length > 2) {
        let screenCoordinates = freehandFeatureCoords;
        let featureCoordinates = [];
        let screenX, screenY = 0;
        for (let i = 0; i < screenCoordinates.length; i++) {
          screenX = screenCoordinates[i][0];
          screenY = screenCoordinates[i][1];
          let geoCoordinates = Platform.OS === 'web' ? mapRef.current.unproject([screenX, screenY]).toArray()
            : await mapRef.current.getCoordinateFromView([screenX, screenY]);
          featureCoordinates.push(geoCoordinates);
        }
        let feature;
        if (mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON) {
          featureCoordinates.push(featureCoordinates[0]); // First and Last coordinates of polygon should match
          feature = turf.polygon([featureCoordinates]);
        }
        else feature = turf.lineString(featureCoordinates);
        if (currentImageBasemap) { //create new spot for imagebasemap - needs lat long to pixel conversion
          feature = useMaps.convertFeatureGeometryToImagePixels(feature);
          feature.properties.image_basemap = currentImageBasemap.id;
        }
        else if (stratSection) { //create new spot for strat section - needs lat long to pixel conversion
          feature = useMaps.convertFeatureGeometryToImagePixels(feature);
          feature.properties.strat_section_id = stratSection.strat_section_id;
        }
        if (isSelectingForStereonet) await getStereonetForFeature(feature);
        else if (isSelectingForTagging) selectSpotsForTagging(feature);
        else {
          const symbology = useSymbology.getSymbology(feature);
          feature.properties.symbology = symbology;
          newOrEditedSpot = await useSpots.createSpot(feature);
          dispatch(setSelectedSpot(newOrEditedSpot));
          dispatch(setFreehandFeatureCoords(undefined));// reset the freeHandCoordinates
        }
      }
    }
    else if (!isEmpty(mapPropsMutable.drawFeatures)) {
      let newFeature = mapPropsMutable.drawFeatures[0];  // If one draw feature the Spot is just a point
      // If there is more than one draw feature (should be no more than three) the first is the first vertex
      // placed, the second is the line or polygon between the vertices, and the third is the last vertex placed
      // Grab the second feature to create the Spot
      if (mapPropsMutable.drawFeatures.length > 1) {
        newFeature = mapPropsMutable.drawFeatures.splice(1, 1)[0];
      }
      const symbology = useSymbology.getSymbology(newFeature);
      newFeature.properties.symbology = symbology;
      if (currentImageBasemap) { //create new spot for imagebasemap - needs lat long to pixel conversion
        newFeature = useMaps.convertFeatureGeometryToImagePixels(newFeature);
        newFeature.properties.image_basemap = currentImageBasemap.id;
      }
      else if (stratSection) { //create new spot for imagebasemap - needs lat long to pixel conversion
        newFeature = useMaps.convertFeatureGeometryToImagePixels(newFeature);
        newFeature.properties.strat_section_id = stratSection.strat_section_id;
      }
      if (isSelectingForStereonet) await getStereonetForFeature(newFeature);
      if (isSelectingForTagging) selectSpotsForTagging(newFeature);
      else {
        newOrEditedSpot = await useSpots.createSpot(newFeature);
        dispatch(setSelectedSpot(newOrEditedSpot));
      }
      setDrawFeatures([]);
    }
    console.log('Draw ended.');
    return Promise.resolve(newOrEditedSpot);
  };

  const selectSpotsForTagging = async (feature) => {
    const selectedSpots = await useMapFeatures.getLassoedSpots(mapPropsMutable.spotsNotSelected, feature);
    if (selectedSpots.length > 0) {
      dispatch(setIntersectedSpotsForTagging(selectedSpots));
      dispatch(setModalVisible({modal: MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS}));
    }
    else {
      alert(
        'Error!',
        'No Spots selected.',
      );
    }
  };

  const getStereonetForFeature = async (feature) => {
    const selectedSpots = await useMapFeatures.getLassoedSpots(mapPropsMutable.spotsNotSelected, feature);
    console.log('Selected Spots', selectedSpots);
    await useMapFeatures.getStereonet(selectedSpots);
  };

  const cancelDraw = () => {
    setDrawFeatures([]);
    console.log('Draw canceled.');
  };

  const cancelEdits = async () => {
    console.log('Canceling editing...');
    if (!isEmpty(editingModeData.spotEditing)) {
      const spotOrig = spots[editingModeData.spotEditing.properties.id];
      setDisplayedSpots([spotOrig]);
      await dispatch(setSelectedSpot(spotOrig));
    }
    else setDisplayedSpots([]);
    clearEditing();
  };

  const saveEdits = async () => {
    console.log('Saving edits...', 'spotsNotEdited', editingModeData.spotsNotEdited, 'spotsEdited',
      editingModeData.spotsEdited);
    if (isEmpty(editingModeData.spotEditing)) setDisplayedSpots([]);
    else {
      setDisplayedSpots([editingModeData.spotEditing]);
      await dispatch(setSelectedSpot(editingModeData.spotEditing));
    }
    if (!isEmpty(editingModeData.spotsEdited)) {
      const spotIds = editingModeData.spotsEdited.map(s => s.properties.id);
      dispatch(updatedModifiedTimestampsBySpotsIds(spotIds));
      dispatch(editedSpots(editingModeData.spotsEdited));
    }
    clearEditing();
  };

  const clearEditing = () => {
    console.log('Clearing editing data...');
    clearVertexes();
    setEditingModeData(initialEditingModeData);
    setDrawFeatures([]);
    clearSelectedVertexToEdit();
  };

  const startEditing = (spotToEdit, vertexToEdit, index) => {
    startEdit();
    clearEditing();
    const mappedSpots = useMaps.getAllMappedSpots();
    setEditingModeData(d => ({
      ...d,
      spotEditing: spotToEdit ? spotToEdit : {},
      spotsEdited: [],
      spotsNotEdited: mappedSpots,
    }));
    spotToEdit ? console.log('Set Spot to edit:', spotToEdit) : console.log('No Spot selected to edit.');
    // #114, editing a spot should immediately identify it as the selected spot and hence update the notebook panel.
    setDisplayedSpotsWhileEditing(spotToEdit, [], mappedSpots);
    if (!isEmpty(spotToEdit)) {
      dispatch(setSelectedSpot(spotToEdit));
      setEditFeatures(spotToEdit);
    }
    // while starting to edit the spot, set the vertex active to move immediately, if available
    if (vertexToEdit) {
      if (spotToEdit.geometry.type !== 'Point') {
        setSelectedVertexToEdit(vertexToEdit);
        setEditingModeData(d => ({
          ...d,
          vertexIndex: index,
        }));
      }
    }
    if (turf.getType(spotToEdit) === 'Point') setSelectedVertexToEdit(spotToEdit);
  };

  // Handle a long press on the map by making the point or vertex at the point "selected"
  const onMapLongPress = async (e) => {
    console.log('Map long press detected:', e);
    const [screenPointX, screenPointY] = Platform.OS === 'web' ? [e.point.x, e.point.y]
      : Platform.OS === 'android' ? [e.properties.screenPointX / PixelRatio.get(), e.properties.screenPointY / PixelRatio.get()]
        : [e.properties.screenPointX, e.properties.screenPointY];
    const spotToEdit = await useMaps.getSpotAtPress(screenPointX, screenPointY);
    const mappedSpots = useMaps.getAllMappedSpots();
    if (mapMode === MAP_MODES.VIEW && !isEmpty(mappedSpots)) {
      if (isEmpty(spotToEdit)) startEditing({});
      else {
        let closestVertexDetails = {};
        let closestVertexToSelect = await useMaps.getDrawFeatureAtPress(screenPointX, screenPointY);
        if (isEmpty(closestVertexToSelect)) {
          // draw features did not return anything - generally a scenario of selecting a vertex on a spot long press.
          closestVertexDetails = await useMaps.identifyClosestVertexOnSpotPress(spotToEdit, screenPointX, screenPointY,
            editingModeData);
          closestVertexToSelect = closestVertexDetails[0];
          startEditing(spotToEdit, closestVertexToSelect, closestVertexDetails[1]);
        }
      }
    }
    else if (mapMode === MAP_MODES.EDIT) {
      if (isEmpty(spotToEdit)) console.log('Already in editing mode and no Spot found where pressed. No action taken.');
      else if (!isEmpty(editingModeData.spotEditing)) {
        let spotEditingCopy = JSON.parse(JSON.stringify(editingModeData.spotEditing));
        if (turf.getType(spotEditingCopy) === 'LineString' || turf.getType(spotEditingCopy) === 'Polygon') {
          const vertexSelected = await useMaps.getDrawFeatureAtPress(screenPointX, screenPointY);
          if (spotEditingCopy.properties.id === spotToEdit.properties.id) {
            let vertexAdded = {};
            if (isEmpty(vertexSelected)) {
              console.log('Adding new vertex...');
              // To add a vertex to a line the new point selected must be on the line
              if (turf.getType(spotEditingCopy) === 'LineString' && !isEmpty(spotToEdit)) {
                if (currentImageBasemap || stratSection) {
                  spotEditingCopy = useMaps.convertImagePixelsToLatLong(spotEditingCopy);
                  [spotEditingCopy, vertexAdded] = addVertexToLine(spotEditingCopy, e.geometry);
                  spotEditingCopy = useMaps.convertFeatureGeometryToImagePixels(spotEditingCopy);
                  setSelectedSpotToEdit(useMaps.convertFeatureGeometryToImagePixels(vertexAdded));
                }
                else {
                  [spotEditingCopy, vertexAdded] = addVertexToLine(spotEditingCopy, e.geometry);
                  setSelectedSpotToEdit(vertexAdded);
                }
                setEditingModeData(d => ({
                  ...d,
                  vertexIndex: vertexAdded.properties.index + 1,
                }));
              }
              else if (turf.getType(spotEditingCopy) === 'Polygon' && !isEmpty(spotToEdit)) {
                if (currentImageBasemap || stratSection) {
                  spotEditingCopy = useMaps.convertImagePixelsToLatLong(spotEditingCopy);
                  [spotEditingCopy, vertexAdded] = addVertexToPolygon(spotEditingCopy, e.geometry);
                  spotEditingCopy = useMaps.convertFeatureGeometryToImagePixels(spotEditingCopy);
                  setSelectedSpotToEdit(useMaps.convertFeatureGeometryToImagePixels(vertexAdded));
                }
                else {
                  [spotEditingCopy, vertexAdded] = addVertexToPolygon(spotEditingCopy, e.geometry);
                  setSelectedSpotToEdit(vertexAdded);
                }
                setEditingModeData(d => ({
                  ...d,
                  vertexIndex: vertexAdded.properties.index + 1,
                }));
              }
            }
            else {
              console.log('Deleting selected vertex...');
              const coords = turf.getCoords(spotEditingCopy);
              const indexOfCoordinatesToUpdate = getVertexIndexInSpotToEdit(vertexSelected);
              let isModified = false;
              if (turf.getType(spotEditingCopy) === 'LineString' && coords.length > 2) {
                for (let i = 0; i < coords.length; i++) {
                  if (indexOfCoordinatesToUpdate.includes(i)) {
                    spotEditingCopy.geometry.coordinates.splice(i, 1);
                    isModified = true;
                  }
                }
              }
              else if (turf.getType(spotEditingCopy) === 'Polygon' && coords[0].length > 4) {
                for (let i = 0; i < coords.length; i++) {
                  for (let j = 0; j < coords[i].length; j++) {
                    if (indexOfCoordinatesToUpdate.includes(j)) {
                      spotEditingCopy.geometry.coordinates[i].splice(j, 1);
                      isModified = true;
                    }
                  }
                }
                if (indexOfCoordinatesToUpdate.includes(0)) {
                  // when the first spot is deleted, update the last spot to the current first spot.
                  spotEditingCopy.geometry.coordinates[0][spotEditingCopy.geometry.coordinates[0].length - 1] = spotEditingCopy.geometry.coordinates[0][0];
                }
              }
              else console.log('Not enough vertices in selected feature to delete one.');
              if (isModified) {
                spotEditingCopy.properties.modified_timestamp = Date.now();
                console.log('Finished deleting vertex. Edited Spot:', spotEditingCopy);
              }
              else console.warn('Problem editing Spot');
            }
            console.log('Edited coords:', turf.getCoords(spotEditingCopy));
            let explodedFeatures = turf.explode(spotEditingCopy).features;
            // If polygon remove last exploded point because it is the same as the first
            if (turf.getType(spotEditingCopy) === 'Polygon') explodedFeatures.pop();
            explodedFeatures = explodedFeatures.map((feature) => {
              return {
                ...feature,
                properties: {
                  ...feature.properties,
                  tempEditId: getNewUUID(),
                },
              };
            });
            if (currentImageBasemap || stratSection) { // if imagebasemap, features, need to be converted to getLatLng inOrder to project them.
              if (turf.getType(spotEditingCopy) === 'Polygon' || turf.getType(spotEditingCopy) === 'LineString') {
                explodedFeatures = explodedFeatures.map(spot => useMaps.convertImagePixelsToLatLong(spot));
              }
            }
            setDrawFeatures(explodedFeatures);
            const spotsEditedTmp = editingModeData.spotsEdited.filter(
              spotEdited => spotEdited.properties.id !== spotEditingCopy.properties.id);
            spotsEditedTmp.push(spotEditingCopy);
            const spotsNotEditedTmp = editingModeData.spotsNotEdited.filter(
              spotNotEdited => spotNotEdited.properties.id !== spotEditingCopy.properties.id);
            setEditingModeData(d => ({
              ...d,
              spotEditing: spotEditingCopy,
              spotsEdited: spotsEditedTmp,
              spotsNotEdited: spotsNotEditedTmp,
            }));
            setDisplayedSpotsWhileEditing(spotEditingCopy, spotsEditedTmp, spotsNotEditedTmp);
            clearSelectedVertexToEdit();
            //setSelectedVertexToEdit(vertexToEditThisScope);
            console.log('Finished editing Spot. Spot Editing: ', spotEditingCopy);
          }
          else console.log('Invalid vertex selected. No action');
        }
        else console.log('Selected Spot is not a line or polygon. No action taken.');
      }
      else console.log('No feature selected. No action taken.');
    }
    else console.log('No Spots to edit. No action taken.');
  };

  // Add a new vertex to a polygon
  const addVertexToPolygon = (polygon, pressedScreenPointGeom) => {
    console.log('Adding vertex to selected polygon feature...');

    // Get all the lines that make up the polygon
    let lines = [];
    const coords = turf.getCoords(polygon)[0];
    for (let i = 0; i < coords.length - 1; i++) {
      lines.push(turf.lineString([coords[i], coords[i + 1]]));
    }

    // Get the nearest point among all lines to the pressed screen point
    const nearestPointOnLine = lines.reduce((acc, line, i) => {
      let nearestPointToTest = turf.nearestPointOnLine(line, pressedScreenPointGeom);
      nearestPointToTest.properties.index = i;
      return isEmpty(acc) || nearestPointToTest.properties.dist < acc.properties.dist ? nearestPointToTest : acc;
    }, {});

    // Add the new vertex to the polygon
    const newPolygon = JSON.parse(JSON.stringify(polygon));
    newPolygon.geometry.coordinates[0].splice(nearestPointOnLine.properties.index + 1, 0,
      nearestPointOnLine.geometry.coordinates);

    return [newPolygon, nearestPointOnLine];
  };

  // Add a new vertex to a line
  const addVertexToLine = (line, pressedScreenPointGeom) => {
    console.log('Adding vertex to selected line feature...');
    const newPointOnLine = turf.nearestPointOnLine(line, pressedScreenPointGeom);
    const i = newPointOnLine.properties.index;
    line.geometry.coordinates.splice(i + 1, 0, newPointOnLine.geometry.coordinates);
    return [line, newPointOnLine];
  };

  const zoomToSpot = () => {
    useMaps.zoomToSpot(mapRef.current, cameraRef.current);
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
      setDefaultGeomType(geomType);
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
      const gotSpotsInMapExtent = await useMapFeatures.getLassoedSpots(
        [...mapProps.spotsSelected, ...mapProps.spotsNotSelected],
        bboxPoly);
      dispatch(setSpotsInMapExtent(gotSpotsInMapExtent));
    }
  };

  // Zoom map to the extent of the mapped Spots
  const zoomToSpotsExtent = () => {
    const spotsToZoomTo = [...mapProps.spotsSelected, ...mapProps.spotsNotSelected];
    useMaps.zoomToSpots(spotsToZoomTo, mapRef.current, cameraRef.current);
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

  const toggleUserLocation = (value) => {
    setMapPropsMutable(m => ({
      ...m,
      showUserLocation: value,
    }));
  };

  useImperativeHandle(mapComponentRef, () => {
    return {
      cancelDraw: cancelDraw,
      cancelEdits: cancelEdits,
      clearSelectedSpots: clearSelectedSpots,
      createDefaultGeom: createDefaultGeom,
      endDraw: endDraw,
      endMapMeasurement: endMapMeasurement,
      getCurrentBasemap: getCurrentBasemap,
      getCurrentZoom: getCurrentZoom,
      getExtentString: getExtentString,
      getTileCount: getTileCount,
      goToCurrentLocation: goToCurrentLocation,
      moveVertex: moveVertex,
      saveEdits: saveEdits,
      toggleUserLocation: toggleUserLocation,
      zoomToCenterOfflineTile: zoomToCenterOfflineTile,
      zoomToCustomMap: zoomToCustomMap,
      zoomToSpot: zoomToSpot,
      zoomToSpotsExtent: zoomToSpotsExtent,
    };
  });

  return (
    <View style={{flex: 1, zIndex: -1}}>
      {mapProps.basemap && <Basemap {...mapProps} forwardedRef={forwardedRef}/>}
      {renderSetInCurrentViewModal()}
      {vertexStartCoords && <VertexDrag/>}
    </View>
  );
};

export default forwardRef(Map);
