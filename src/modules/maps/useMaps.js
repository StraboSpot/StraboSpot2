import {useEffect} from 'react';
import {Platform} from 'react-native';

import Geolocation from '@react-native-community/geolocation';
import * as turf from '@turf/turf';
import proj4 from 'proj4';
import {useDispatch, useSelector} from 'react-redux';

import {STRABO_APIS} from '../../services/deviceAndAPI.constants';
import useServerRequestsHook from '../../services/useServerRequests';
import {isEmpty} from '../../shared/Helpers';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setErrorMessagesModalVisible,
  setOfflineMapsModalVisible,
} from '../home/home.slice';
import {SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {addedProject, updatedProject} from '../project/projects.slice';
import {setSelectedSpot} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import {BASEMAPS, GEO_LAT_LNG_PROJECTION, MAP_PROVIDERS, PIXEL_PROJECTION} from './maps.constants';
import {
  addedCustomMap,
  deletedCustomMap,
  selectedCustomMapToEdit,
  setCurrentBasemap,
  setMapSymbols,
} from './maps.slice';

const useMaps = (mapRef) => {
  const [useServerRequests] = useServerRequestsHook();
  const [useSpots] = useSpotsHook();
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);
  const customMaps = useSelector(state => state.map.customMaps);
  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const isOnline = useSelector(state => state.home.isOnline);
  const selectedSymbols = useSelector(state => state.map.symbolsOn) || [];
  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const spots = useSelector(state => state.spot.spots);
  const userMapboxToken = useSelector(state => state.user.mapboxToken);

  useEffect(() => {
    console.log('UE useMaps [isMainMenuPanelVisible]', isMainMenuPanelVisible);
  }, [isMainMenuPanelVisible]);

  const buildStyleURL = map => {
    let tileURL;
    let mapID = map.id;
    if (map.source === 'map_warper' || map.source === 'strabospot_mymaps') tileURL = map.url[0] + map.id + '/' + map.tilePath;
    else {
      tileURL = map.url[0] + (map.source === 'mapbox_styles' && map.url[0].includes('file://') ? mapID.split(
        '/')[1] : mapID) + map.tilePath + (map.url[0].includes(
        'https://') ? '?access_token=' + userMapboxToken : '');
    }
    const customBaseMapStyleURL = {
      source: map.source,
      id: map.id,
      bbox: map?.bbox,
      version: 8,
      sources: {
        [map.id]: {
          type: 'raster',
          tiles: [tileURL],
          tileSize: 256,
        },
      },
      sprite: 'mapbox://sprites/mapbox/bright-v8',
      glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      layers: [
        {
          'id': 'background',
          'type': 'background',
          'paint': {
            'background-color': 'white',
          },
        },
        {
          id: map.id,
          type: 'raster',
          source: map.id,
          minzoom: 0,
        },
      ],
    };
    return customBaseMapStyleURL;
  };

  const buildTileUrl = (basemap) => {
    let tileUrl = basemap.url[0];
    if (basemap.source === 'osm') tileUrl = tileUrl + basemap.tilePath;
    if (basemap.source === 'map_warper' || basemap.source === 'strabospot_mymaps') tileUrl = tileUrl + basemap.id + '/' + basemap.tilePath;
    else tileUrl = tileUrl + basemap.id + basemap.tilePath + '?access_token=' + userMapboxToken;
    return tileUrl;
  };

  const deleteMap = async (mapId) => {
    console.log('Deleting Map Here');
    console.log('map: ', mapId);
    const projectCopy = {...project};
    const customMapsCopy = {...customMaps};
    if (mapId.includes('/')) {
      const mapboxStylesId = mapId.split('/');
      delete customMapsCopy[mapboxStylesId[1]];
    }
    else delete customMapsCopy[mapId];
    if (projectCopy.other_maps) {
      const filteredCustomMaps = projectCopy.other_maps.filter(map => map.id !== mapId);
      dispatch(addedProject({...projectCopy, other_maps: filteredCustomMaps})); // Deletes map from project
    }
    dispatch(deletedCustomMap(customMapsCopy)); // replaces customMaps with updated object
    dispatch(setSidePanelVisible({view: null, bool: false}));
  };

  // Convert WGS84 to x,y pixels, assuming x,y are web mercator, or vice versa
  const convertCoords = (feature, fromProjection, toProjection) => {
    if (feature.geometry.type === 'Point') {
      feature.geometry.coordinates = proj4(fromProjection, toProjection, feature.geometry.coordinates);
    }
    else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiPoint') {
      feature.geometry.coordinates = feature.geometry.coordinates.map((pointCoords) => {
        return proj4(fromProjection, toProjection, pointCoords);
      });
    }
    else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiLineString') {
      feature.geometry.coordinates = feature.geometry.coordinates.map((lineCoords) => {
        return lineCoords.map((pointCoords) => proj4(fromProjection, toProjection, pointCoords));
      });
    }
    else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates = feature.geometry.coordinates.map((polygonCoords) => {
        return polygonCoords.map((lineCoords) => {
          return lineCoords.map((pointCoords) => proj4(fromProjection, toProjection, pointCoords));
        });
      });
    }
    // Interbedded (Geometry Collections)
    else if (feature.geometry.type === 'GeometryCollection') {
      feature.geometry.geometries = feature.geometry.geometries.map((geometry) => {
        return {
          type: geometry.type,
          coordinates: geometry.coordinates.map((lineCoords) => {
            return lineCoords.map((pointCoords) => proj4(fromProjection, toProjection, pointCoords));
          }),
        };
      });
    }
    return feature;
  };

  // Convert WGS84 to image x,y pixels, assuming x,y are web mercator
  const convertFeatureGeometryToImagePixels = (feature) => {
    return convertCoords(feature, GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION);
  };

  // Convert image x,y pixels to WGS84, assuming x,y are web mercator
  const convertImagePixelsToLatLong = (feature) => {
    return convertCoords(feature, PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION);
  };

  const customMapDetails = (map) => {
    dispatch(selectedCustomMapToEdit(map));
    dispatch(setSidePanelVisible({view: SIDE_PANEL_VIEWS.MANAGE_CUSTOM_MAP, bool: true}));
  };

  // All Spots mapped on current map
  const getAllMappedSpots = () => {
    const spotsWithGeometry = useSpots.getMappableSpots();      // Spots with geometry
    let mappedSpots = {};
    if (currentImageBasemap) {
      mappedSpots = spotsWithGeometry.filter(
        spot => spot.properties.image_basemap && spot.properties.image_basemap === currentImageBasemap.id);
    }
    else if (stratSection) {
      mappedSpots = spotsWithGeometry.filter(
        spot => spot.properties.strat_section_id && spot.properties.strat_section_id === stratSection.strat_section_id);
    }
    else {
      mappedSpots = spotsWithGeometry.filter(
        spot => !spot.properties.strat_section_id && !spot.properties.image_basemap);
    }
    console.log('All Mapped Spots on this map', mappedSpots);
    return mappedSpots;
  };

  const getBboxCoords = async (map) => {
    if (map.source === 'strabospot_mymaps') {
      const myMapsBbox = await useServerRequests.getMyMapsBbox(map.id);
      if (!isEmpty(myMapsBbox)) return myMapsBbox.data.bbox;
    }
  };

  const getClosestSpotDistanceAndIndex = (distancesFromSpot) => {
    var minDistance = Number.MAX_VALUE;
    var minIndex = -1;
    for (var j = 0; j < distancesFromSpot.length; j++) {
      if (minDistance > distancesFromSpot[j]) { // trying to get the minimum distance
        minDistance = distancesFromSpot[j];
        minIndex = j;
      } // else we can ignore that feature.
    }
    return [minDistance, minIndex];
  };

  // Identify the coordinate span for the image basemap adjusted by the given [x,y] (adjustment used for strat sections)
  const getCoordQuad = (imageBasemapProps, altOrigin) => {
    // identify the [lat,lng] corners of the image basemap
    const x = altOrigin && altOrigin.x || 0;
    const y = altOrigin && altOrigin.y || 0;
    const bottomLeft = altOrigin ? proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION, [x, y]) : [x, y];
    const bottomRight = proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION, [imageBasemapProps.width + x, y]);
    const topRight = proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION,
      [imageBasemapProps.width + x, imageBasemapProps.height + y]);
    const topLeft = proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION, [x, imageBasemapProps.height + y]);
    let coordQuad = [topLeft, topRight, bottomRight, bottomLeft];
    console.log('The coordinates identified for image-basemap :', coordQuad);
    return coordQuad;
  };

  // Get the current location from the device and set it in the state
  const getCurrentLocation = async () => {
    const geolocationOptions = {timeout: 5000, maximumAge: 10000, enableHighAccuracy: Platform.OS === 'ios'};
    // Issue with Android not getting current location if enableHighAccuracy is true
    return (
      new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            // setUserLocationCoords([position.coords.longitude, position.coords.latitude]);
            console.log('Got Current Location: [', position.coords.longitude, ', ', position.coords.latitude, ']');
            resolve(position.coords);
          },
          (error) => reject('Error getting current location: ' + (error.message ? error.message : 'Unknown Error')),
          geolocationOptions,
        );
      })
    );
  };

  const getDistancesFromSpot = async (screenPointX, screenPointY, featuresInRect) => {
    const dummyFeature = {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'Point',
        'coordinates': [screenPointX, screenPointY],
      },
    };
    var distances = [];
    var screenCoords = [];
    for (var i = 0; i < featuresInRect.length; i++) {
      if (featuresInRect[i].geometry.type === 'Polygon' || featuresInRect[i].geometry.type === 'LineString'
        || featuresInRect[i].geometry.type === 'MultiLineString' || featuresInRect[i].geometry.type === 'MultiPolygon') {
        // trying to get a distance that is closest from the vertices of a polygon or line
        // to the dummy feature with screenX and screenY
        var explodedFeatures = turf.explode(featuresInRect[i]);
        var explodedFeaturesDistancesFromSpot = await getDistancesFromSpot(screenPointX, screenPointY,
          explodedFeatures.features);
        const [distance, indexWithMinimumIndex] = getClosestSpotDistanceAndIndex(explodedFeaturesDistancesFromSpot);
        distances[i] = distance;
      }
      else {
        var eachFeature = JSON.parse(JSON.stringify(featuresInRect[i]));
        screenCoords = await mapRef.current.getPointInView(eachFeature.geometry.coordinates);
        eachFeature.geometry.coordinates = screenCoords;
        distances[i] = turf.distance(dummyFeature, eachFeature);
      }
    }
    return distances;
  };

  // Get the feature from the draw layer where the screen was pressed
  const getDrawFeatureAtPress = async (screenPointX, screenPoint, drawFeaturesCopy) => {
    // console.log('mapMode in getDrawFeatureAtPress', props.mapMode);
    let drawFeatureFound = await getFeatureInRect(screenPointX, screenPoint, ['pointLayerDraw']);
    if (!isEmpty(drawFeatureFound)) {
      console.log('drawFeatureFound', drawFeatureFound, 'mapPropsMutable.drawFeatures', drawFeaturesCopy);
      // In getFeatureInRect the function queryRenderedFeaturesInRect returns a feature with coordinates
      // truncated to 5 decimal places so get the matching feature with full coordinates using a temp Id
      drawFeatureFound = drawFeaturesCopy.find(
        feature => feature.properties.tempEditId === drawFeatureFound.properties.tempEditId);
      console.log('Got draw feature at press: ', drawFeatureFound, 'in Spot: ',
        spots[drawFeatureFound.properties.id]);
    }
    return Promise.resolve(...[drawFeatureFound]);
  };

  const getExtentAndZoomCall = (extentString, zoomLevel) => {
    console.log(STRABO_APIS.TILE_COUNT + '?extent=' + extentString + '&zoom=' + zoomLevel);
    return STRABO_APIS.TILE_COUNT + '?extent=' + extentString + '&zoom=' + zoomLevel;
  };

  // Get the feature within a bounding box from a given layer, returning only the first one if there is more than one
  const getFeatureInRect = async (screenPointX, screenPointY, layers) => {
    const r = 30; // half the width (in pixels?) of bounding box to create
    const bbox = [screenPointY + r, screenPointX + r, screenPointY - r, screenPointX - r];
    const featureCollectionInRect = await mapRef.current.queryRenderedFeaturesInRect(bbox, null, layers);
    const featuresInRect = featureCollectionInRect.features;
    let featureFound = {};
    if (featuresInRect.length > 1) {
      const distances = await getDistancesFromSpot(screenPointX, screenPointY, featuresInRect);
      const [distance, indexWithMinimumIndex] = getClosestSpotDistanceAndIndex(distances);
      featureFound = featuresInRect[indexWithMinimumIndex];
    }
    else if (featuresInRect.length === 1) featureFound = featuresInRect[0];
    else console.log('No feature found where pressed.');
    return Promise.resolve(featureFound);
  };

  const getMeasureFeatures = async (e, measureFeaturesTemp, setDistance) => {
    let distance;
    const {screenPointX, screenPointY} = e.properties;

    // Used to draw a line between points
    const linestring = {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': [],
      },
    };

    const featureAtPoint = await getFeatureInRect(screenPointX, screenPointY, ['measureLayerPoints']);
    // console.log('Feature at pressed point:', featureAtPoint);

    // Remove the linestring from the group so we can redraw it based on the points collection.
    if (measureFeaturesTemp.length > 1) measureFeaturesTemp.pop();

    // Clear the distance container to populate it with a new value.
    // props.setDistance(0);

    // If a feature was clicked, remove it from the map.
    if (!isEmpty(featureAtPoint)) {
      const id = featureAtPoint.properties.id;
      measureFeaturesTemp = measureFeaturesTemp.filter(point => point.properties.id !== id);
    }
    else {
      const point = {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': e.geometry.coordinates,
        },
        'properties': {
          'id': String(new Date().getTime()),
        },
      };
      measureFeaturesTemp.push(point);
    }

    if (measureFeaturesTemp.length > 1) {
      linestring.geometry.coordinates = measureFeaturesTemp.map(point => point.geometry.coordinates);
      measureFeaturesTemp.push(linestring);

      distance = turf.length(linestring);
      setDistance(distance);
      // console.log(`Total distance: ${distance.toLocaleString()}km`);
    }
    // console.log('Measure Features', measureFeaturesTemp);

    return measureFeaturesTemp;
  };

  // Get the Spot where screen was pressed
  const getSpotAtPress = async (screenPointX, screenPoint) => {
    // console.log('mapMode in getSpotAtPress', props.mapMode);
    const spotLayers = ['pointLayerNotSelected', 'lineLayerNotSelected', 'lineLayerNotSelectedDotted',
      'lineLayerNotSelectedDashed', 'lineLayerNotSelectedDotDashed', 'polygonLayerNotSelected',
      'polygonLayerWithPatternNotSelected', 'pointLayerSelected', 'lineLayerSelected', 'lineLayerSelectedDotted',
      'lineLayerSelectedDashed', 'lineLayerSelectedDotDashed', 'polygonLayerSelected', 'polygonLayerWithPatternSelected'];
    let spotFound = await getFeatureInRect(screenPointX, screenPoint, spotLayers);
    if (!isEmpty(spotFound)) {
      // In getFeatureInRect the function queryRenderedFeaturesInRect returns a feature with coordinates
      // truncated to 5 decimal places so get the matching feature with full coordinates using a temp Id
      // spotFound = spots[spotFound.properties.id];
      // spotFound = [...mapProps.spotsNotSelected, ...mapProps.spotsSelected].find(
      //   spot => spot.properties.id === spotFound.properties.id);
      spotFound = useSpots.getSpotById(spotFound.properties.id);
      console.log('Got Spot at press: ', spotFound);
    }
    return Promise.resolve(...[spotFound]);
  };

  // Spots with mulitple measurements become mulitple features, one feature for each measurement
  const getSpotsAsFeatures = (spotsToFeatures) => {
    let mappedFeatures = [];
    spotsToFeatures.map(spot => {
      if ((spot.geometry.type === 'Point' || spot.geometry.type === 'MultiPoint') && spot.properties.orientation_data) {
        spot.properties.orientation_data.map((orientation, i) => {
          const feature = JSON.parse(JSON.stringify(spot));
          delete feature.properties.orientation_data;
          orientation.associated_orientation && orientation.associated_orientation.map(associatedOrientation => {
            feature.properties.orientation = associatedOrientation;
            mappedFeatures.push(JSON.parse(JSON.stringify(feature)));
          });
          feature.properties.orientation = orientation;
          //feature.properties.orientation_num = i.toString();
          mappedFeatures.push(JSON.parse(JSON.stringify(feature)));
        });
      }
      else if (spot.geometry.type === 'GeometryCollection') {
        spot.geometry.geometries.forEach((g, i) => {
          const feature = JSON.parse(JSON.stringify(spot));
          if (i % 2 === 1) feature.properties.isInterbed = true;
          feature.geometry = g;
          mappedFeatures.push(feature);
        });
      }
      else mappedFeatures.push(JSON.parse(JSON.stringify(spot)));
    });
    return mappedFeatures;
  };

  // Point Spots the are currently visible on the map (i.e. not toggled off in the Map Symbol Switcher)
  const getVisibleMappedSpots = (mappedSpots) => {
    return (
      mappedSpots.filter(spot => turf.getType(spot) !== 'Point'
        || (spot.properties.orientation_data
          && !isEmpty(spot.properties.orientation_data.filter(orientation => orientation.feature_type
            && selectedSymbols.includes(orientation.feature_type)))))
    );
  };

  // Gather and set the feature types that are present in the mapped Spots
  const mapSymbols = (mappedSpots) => {
    const featureTypes = mappedSpots.reduce((acc, spot) => {
      const spotFeatureTypes = spot.properties.orientation_data
        && spot.properties.orientation_data.reduce((acc1, orientation) => {
          return orientation.feature_type ? [...new Set([...acc1, orientation.feature_type])] : acc1;
        }, []);
      return spotFeatureTypes ? [...new Set([...acc, ...spotFeatureTypes])] : acc;
    }, []);
    dispatch(setMapSymbols(featureTypes));
  };

  // Get selected and not selected Spots to display when not editing
  const getDisplayedSpots = (selectedSpots) => {
    let mappedSpots = getAllMappedSpots();
    mapSymbols(mappedSpots);

    // If any map symbol toggle is ON filter out the Point features & Spots that are not visible
    if (!isAllSymbolsOn) mappedSpots = getVisibleMappedSpots(mappedSpots);

    // Separate selected Spots and not selected Spots (Point Spots need to be in both
    // selected and not selected since the selected symbology is a halo around the point)
    const selectedIds = selectedSpots.map(sel => sel.properties.id);
    const selectedMappedSpots = mappedSpots.filter(spot => selectedIds.includes(spot.properties.id));
    const notSelectedMappedSpots = mappedSpots.filter(spot => !selectedIds.includes(spot.properties.id)
      || spot.geometry.type === 'Point');

    // console.log('Selected Spots to Display on this Map:', selectedMappedSpots);
    // console.log('Not Selected Spots to Display on this Map:', notSelectedMappedSpots);
    return [selectedMappedSpots, notSelectedMappedSpots];
  };

  const getProviderInfo = (source) => {
    console.log(MAP_PROVIDERS[source]);
    return MAP_PROVIDERS[source];
  };

  const handleError = (message, err) => {
    dispatch(clearedStatusMessages());
    dispatch(addedStatusMessage(`${message} \n\n${err}`));
    dispatch(setOfflineMapsModalVisible(false));
    dispatch(setErrorMessagesModalVisible(true));
  };

  // This method is required when the draw features at press returns empty
  // We explode the features and identify the closest vertex from the screen point (x,y) on the spot
  // returns an array of vertex and its index.
  const identifyClosestVertexOnSpotPress = async (spotFound, screenPointX, screenPointY, editingModeData) => {
    let editedSpot = editingModeData.spotsEdited.find(spot => spot.properties.id === spotFound.properties.id);
    spotFound = editedSpot ? editedSpot : spotFound;
    let spotFoundCopy = JSON.parse(JSON.stringify(spotFound));
    if (currentImageBasemap || stratSection) spotFoundCopy = convertImagePixelsToLatLong(spotFoundCopy);
    const explodedFeatures = turf.explode(spotFoundCopy).features;
    const distances = await getDistancesFromSpot(screenPointX, screenPointY, explodedFeatures);
    const [distance, closestVertexIndex] = getClosestSpotDistanceAndIndex(distances);
    // in case of imagebasemap, return the original non converted vertex.
    if (currentImageBasemap || stratSection) {
      return [turf.explode(spotFound).features[closestVertexIndex], closestVertexIndex];
    }
    else return [explodedFeatures[closestVertexIndex], closestVertexIndex];
  };

  // If feature is mapped on geographical map, not an image basemap or strat section
  const isOnGeoMap = (feature) => {
    if (isEmpty(feature)) return false;
    return !feature.properties.image_basemap && !feature.properties.strat_section_id;
  };

  const isOnImageBasemap = (feature) => feature.properties?.image_basemap;

  const isOnStratSection = (feature) => feature.properties?.strat_section_id;

  const saveCustomMap = async (map) => {
    let mapId = map.id;
    let customMap = {};
    const providerInfo = getProviderInfo(map.source);
    let bbox = '';
    // Pull out mapbox styles map id
    if (map.source === 'mapbox_styles' && map.id.includes('mapbox://styles/')) {
      mapId = map.id.split('/').slice(3).join('/');
    }
    customMap = {...map, ...providerInfo, id: mapId, source: map.source};
    const tileUrl = buildTileUrl(customMap);
    let testTileUrl = tileUrl.replace(/({z}\/{x}\/{y})/, '0/0/0');
    if (map.source === 'strabospot_mymaps') testTileUrl = STRABO_APIS.MY_MAPS_CHECK + map.id;
    console.log('Custom Map:', customMap, 'Test Tile URL:', testTileUrl);

    const testUrlResponse = await useServerRequests.testCustomMapUrl(testTileUrl);
    console.log('RES', testUrlResponse);
    if (testUrlResponse) {
      if (!customMap.bbox) bbox = await getBboxCoords(map);
      if (map.overlay && map.id === currentBasemap.id) {
        console.log(('Setting Basemap to Mapbox Topo...'));
        setBasemap(null);
      }
      if (project.other_maps) {
        const otherMapsInProject = project.other_maps;
        if (customMap.source !== 'mapbox_styles') delete customMap.key;
        dispatch(updatedProject(
          {field: 'other_maps', value: [...otherMapsInProject, customMap]}));
      }
      else dispatch(updatedProject({field: 'other_maps', value: [map]}));
      dispatch(addedCustomMap(bbox ? {...customMap, bbox: bbox} : customMap));
      return customMap;
    }
    else throw (customMap.id);
  };

  // Create a point feature at the current location
  const setPointAtCurrentLocation = async () => {
    const currentLocation = await getCurrentLocation();
    let feature = turf.point([currentLocation.longitude, currentLocation.latitude]);
    if (currentLocation.altitude) feature.properties.altitude = currentLocation.altitude;
    if (currentLocation.accuracy) feature.properties.gps_accuracy = currentLocation.accuracy;
    const newSpot = await useSpots.createSpot(feature);
    setSelectedSpotOnMap(newSpot);
    return Promise.resolve(newSpot);
  };

  const setBasemap = async (mapId) => {
    try {
      let newBasemap = {};
      let bbox = '';
      if (!mapId) mapId = 'mapbox.outdoors';
      newBasemap = BASEMAPS.find(basemap => basemap.id === mapId);
      if (newBasemap === undefined) {
        newBasemap = await Object.values(customMaps).find(basemap => {
          console.log(basemap);
          return basemap.id === mapId;
        });
        if (newBasemap) {
          newBasemap = buildStyleURL(newBasemap);
          console.log('Mapbox StyleURL for basemap', newBasemap);
          if (isOnline.isInternetReachable && !newBasemap.bbox && newBasemap.source === 'strabospot_mymaps') {
            bbox = await getBboxCoords(newBasemap);
            newBasemap = {...newBasemap, bbox: bbox};
          }
        }
        else {
          dispatch(clearedStatusMessages());
          dispatch(addedStatusMessage(`Map ${mapId} not found. Setting basemap to Mapbox Topo.`));
          dispatch(setErrorMessagesModalVisible(true));
          setBasemap(null);
        }
      }
      console.log('Setting current basemap to a default basemap...');
      dispatch(setCurrentBasemap(newBasemap));
      return newBasemap;
    }
    catch (err) {
      console.warn('Error is setBasemap', err);
    }
  };

  const setCustomMapSwitchValue = (value, map) => {
    console.log('value', value, 'id', map.mapId);
    const customMapsCopy = JSON.parse(JSON.stringify(customMaps));
    let mapKey = map.id;
    if (mapKey.includes('/')) mapKey = mapKey.split('/')[1];
    if (customMapsCopy[mapKey]) {
      dispatch(addedCustomMap({...customMapsCopy[mapKey], isViewable: value}));
      if (!customMapsCopy[mapKey].overlay) viewCustomMap(map);
    }
  };

  const setSelectedSpotOnMap = (spotToSetAsSelected) => {
    console.log('Set selected Spot:', spotToSetAsSelected);
    dispatch(setSelectedSpot(spotToSetAsSelected));
  };

  const viewCustomMap = (map) => {
    console.log('Setting current basemap to a custom basemap...');
    dispatch(setCurrentBasemap(map));
  };

  const zoomToSpots = async (spotsToZoomTo, map, camera) => {
    if (spotsToZoomTo.every(s => isOnGeoMap(s)) || spotsToZoomTo.every(s => isOnImageBasemap(s))
      || spotsToZoomTo.every(s => isOnStratSection(s))) {
      if (camera) {
        try {
          if (spotsToZoomTo.length === 1) {
            const centroid = turf.centroid(spotsToZoomTo[0]);
            camera.flyTo(turf.getCoord(centroid));
          }
          else if (spotsToZoomTo.length > 1) {
            const features = turf.featureCollection(spotsToZoomTo);
            const [minX, minY, maxX, maxY] = turf.bbox(features);  //bbox extent in minX, minY, maxX, maxY order
            camera.fitBounds([maxX, minY], [minX, maxY], 100, 2500);
          }
        }
        catch (err) {
          throw Error('Error Zooming To Extent of Spots', err);
        }
      }
      else throw Error('Error Getting Map Camera');
    }
    else throw Error('Error Zooming To Extent of Spots');
  };

  return [{
    buildStyleURL: buildStyleURL,
    buildTileUrl: buildTileUrl,
    convertFeatureGeometryToImagePixels: convertFeatureGeometryToImagePixels,
    convertImagePixelsToLatLong: convertImagePixelsToLatLong,
    customMapDetails: customMapDetails,
    deleteMap: deleteMap,
    getAllMappedSpots: getAllMappedSpots,
    getCoordQuad: getCoordQuad,
    getCurrentLocation: getCurrentLocation,
    getDisplayedSpots: getDisplayedSpots,
    getDrawFeatureAtPress: getDrawFeatureAtPress,
    getExtentAndZoomCall: getExtentAndZoomCall,
    getFeatureInRect: getFeatureInRect,
    getMeasureFeatures: getMeasureFeatures,
    getSpotAtPress: getSpotAtPress,
    getSpotsAsFeatures: getSpotsAsFeatures,
    handleError: handleError,
    identifyClosestVertexOnSpotPress: identifyClosestVertexOnSpotPress,
    isOnGeoMap: isOnGeoMap,
    saveCustomMap: saveCustomMap,
    setBasemap: setBasemap,
    setCustomMapSwitchValue: setCustomMapSwitchValue,
    setPointAtCurrentLocation: setPointAtCurrentLocation,
    setSelectedSpotOnMap: setSelectedSpotOnMap,
    viewCustomMap: viewCustomMap,
    zoomToSpots: zoomToSpots,
  }];
};

export default useMaps;
