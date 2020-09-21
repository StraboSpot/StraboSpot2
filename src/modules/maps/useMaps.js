import {useEffect} from 'react';
import {Platform} from 'react-native';

import Geolocation from '@react-native-community/geolocation';
import * as turf from '@turf/turf/index';
import proj4 from 'proj4';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequestsHook from '../../services/useServerRequests';
import {isEmpty} from '../../shared/Helpers';
import {homeReducers} from '../home/home.constants';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {projectReducers} from '../project/project.constants';
import {spotReducers} from '../spots/spot.constants';
import useSpotsHook from '../spots/useSpots';
import {basemaps, mapProviders, mapReducers, geoLatLngProjection, pixelProjection} from './maps.constants';

const useMaps = () => {
  const [useServerRequests] = useServerRequestsHook();
  const [useSpots] = useSpotsHook();
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const customMaps = useSelector(state => state.map.customMaps);
  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const settingsPanel = useSelector(state => state.home.isSettingsPanelVisible);
  const selectedSymbols = useSelector(state => state.map.symbolsOn) || [];
  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);

  useEffect(() => {
    console.log('Settings Panel', settingsPanel);
  }, [settingsPanel]);

  const buildTileUrl = (basemap) => {
    let tileUrl = basemap.url[0];
    if (basemap.source === 'osm') tileUrl = tileUrl + basemap.tilePath;
    if (basemap.source === 'map_warper' || basemap.source === 'strabospot_mymaps') tileUrl = tileUrl + '/' + basemap.id + '/' + basemap.tilePath;
    else tileUrl = tileUrl + basemap.id + basemap.tilePath + (basemap.key ? '?access_token=' + basemap.key : '');
    return tileUrl;
  };

  const deleteMap = async (mapId) => {
    console.log('Deleting Map Here');
    console.log('map: ', mapId);
    const projectCopy = {...project};
    const customMapsCopy = {...customMaps};
    delete customMapsCopy[mapId];
    if (projectCopy.other_maps && projectCopy.other_maps[mapId]) {
      delete projectCopy.other_maps[mapId];
      dispatch({type: projectReducers.PROJECTS, project: projectCopy}); // Deletes map from project
    }
    dispatch({type: mapReducers.DELETE_CUSTOM_MAP, customMaps: customMapsCopy}); // replaces customMaps with updated object
    dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, view: null, bool: false});
    dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: undefined});
    console.log('Saved customMaps to Redux.');
  };

  const convertCoordinateProjections = (sourceProjection, targetProjection, coords) => {
    const [targetX, targetY] = proj4(sourceProjection, targetProjection, coords);
    return [targetX, targetY];
  };

  // Convert WGS84 to image x,y pixels, assuming x,y are web mercator
  const convertFeatureGeometryToImagePixels = (feature) => {
    var imageX, imageY;
    let calculatedCoordinates = [];
    if (feature.geometry.type === 'Point') {
      [imageX, imageY] = convertCoordinateProjections(geoLatLngProjection, pixelProjection,
        feature.geometry.coordinates);
      feature.geometry.coordinates = [imageX, imageY];
    }
    else if (feature.geometry.type === 'Polygon') {
      for (const subArray of feature.geometry.coordinates) {
        for (const innerSubArray of subArray) {
          [imageX, imageY] = convertCoordinateProjections(geoLatLngProjection, pixelProjection, innerSubArray);
          calculatedCoordinates.push([imageX, imageY]);
        }
      }
      feature.geometry.coordinates = [calculatedCoordinates];
    }
    else { // LineString
      for (const subArray of feature.geometry.coordinates) {
        [imageX, imageY] = convertCoordinateProjections(geoLatLngProjection, pixelProjection, subArray);
        calculatedCoordinates.push([imageX, imageY]);
      }
      feature.geometry.coordinates = calculatedCoordinates;
    }
    return feature;
  };

  // Convert image x,y pixels to WGS84, assuming x,y are web mercator
  const convertImagePixelsToLatLong = (feature) => {
    if (feature.geometry.type === 'Point') {
      const coords = feature.geometry.coordinates;
      feature.geometry.coordinates = convertCoordinateProjections(pixelProjection, geoLatLngProjection,
        [coords[0], coords[1]]);
    }
    else if (feature.geometry.type === 'Polygon') {
      let calculatedCoordinates = [];
      for (const subArray of feature.geometry.coordinates) {
        for (const innerSubArray of subArray) {
          let [x, y] = convertCoordinateProjections(pixelProjection, geoLatLngProjection,
            [innerSubArray[0], innerSubArray[1]]);
          calculatedCoordinates.push([x, y]);
        }
      }
      feature.geometry.coordinates = [calculatedCoordinates];
    }
    else {
      let calculatedCoordinates = [];
      for (const subArray of feature.geometry.coordinates) {
        let [x, y] = convertCoordinateProjections(pixelProjection, geoLatLngProjection, [subArray[0], subArray[1]]);
        calculatedCoordinates.push([x, y]);
      }
      feature.geometry.coordinates = calculatedCoordinates;
    }
    return feature;
  };

  const customMapDetails = (map) => {
    dispatch({type: mapReducers.SELECTED_CUSTOM_MAP_TO_EDIT, customMap: map});
    dispatch({
      type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE,
      view: settingPanelReducers.SET_SIDE_PANEL_VIEW.MANAGE_CUSTOM_MAP,
      bool: true,
    });
  };

  // Identify the coordinate span for the for the image basemap.
  const getCoordQuad = (imageBasemapProps) => {
    // identify the [lat,lng] corners of the image basemap
    var bottomLeft = [0, 0];
    var bottomRight = convertCoordinateProjections(pixelProjection, geoLatLngProjection, [imageBasemapProps.width, 0]);
    var topRight = convertCoordinateProjections(pixelProjection, geoLatLngProjection,
      [imageBasemapProps.width, imageBasemapProps.height]);
    var topLeft = convertCoordinateProjections(pixelProjection, geoLatLngProjection, [0, imageBasemapProps.height]);
    var coordQuad = [topLeft, topRight, bottomRight, bottomLeft];
    console.log('The coordinates identified for image-basemap :', coordQuad);
    return coordQuad;
  };

  // Get the current location from the device and set it in the state
  const getCurrentLocation = async () => {
    let geolocationOptions = {timeout: 2500, maximumAge: 10000};
    // Fixes issue with Android not getting current location if enableHighAccuracy is true
    geolocationOptions = Platform.OS === 'ios' ? {enableHighAccuracy: true, ...geolocationOptions} : geolocationOptions;
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          // setUserLocationCoords([position.coords.longitude, position.coords.latitude]);
          console.log('Got Current Location: [', position.coords.longitude, ', ', position.coords.latitude, ']');
          resolve([position.coords.longitude, position.coords.latitude]);
        },
        (error) => reject('Error getting current location: ' + (error.message ? error.message : 'Unknown Error')),
        geolocationOptions,
      );
    });
  };

  // All Spots mapped on curent map
  const getAllMappedSpots = () => {
    const spotsWithGeometry = useSpots.getMappableSpots();      // Spots with geometry
    // Filter out Spots on an strat section
    let mappedSpots = spotsWithGeometry.filter(spot => !spot.properties.strat_section);
    // Filter out Spots on an image_basemap
    if (!currentImageBasemap) mappedSpots = mappedSpots.filter(spot => !spot.properties.image_basemap);
    // console.log('All Mapped Spots on this map', mappedSpots);
    return mappedSpots;
  };

  // Spots with mulitple measurements become mulitple features, one feature for each measurement
  const getSpotsAsFeatures = (spots) => {
    let mappedFeatures = [];
    spots.map(spot => {
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
      else mappedFeatures.push(JSON.parse(JSON.stringify(spot)));
    });
    return mappedFeatures;
  };

  // Point Spots the are currently visible on the map (i.e. not toggled off in the Map Symbol Switcher)
  const getVisibleMappedSpots = (mappedSpots) => {
    return mappedSpots.filter(spot => turf.getType(spot) !== 'Point'
      || (spot.properties.orientation_data
        && !isEmpty(spot.properties.orientation_data.filter(orientation => orientation.feature_type
          && selectedSymbols.includes(orientation.feature_type)))));
  };

  // Gather and set the feature types that are present in the mapped Spots
  const setMapSymbols = (mappedSpots) => {
    const featureTypes = mappedSpots.reduce((acc, spot) => {
      const spotFeatureTypes = spot.properties.orientation_data
        && spot.properties.orientation_data.reduce((acc1, orientation) => {
          return orientation.feature_type ? [...new Set([...acc1, orientation.feature_type])] : acc1;
        }, []);
      return spotFeatureTypes ? [...new Set([...acc, ...spotFeatureTypes])] : acc;
    }, []);
    dispatch({type: mapReducers.SET_MAP_SYMBOLS, mapSymbols: featureTypes});
  };

  // Get selected and not selected Spots to display when not editing
  const getDisplayedSpots = (selectedSpots) => {
    let mappedSpots = getAllMappedSpots();
    setMapSymbols(mappedSpots);

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
    console.log(mapProviders[source]);
    return mapProviders[source];
  };

  const handleError = (message, err) => {
    dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
    dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: `${message} \n\n${err}`});
    dispatch({type: homeReducers.SET_OFFLINE_MAPS_MODAL_VISIBLE, bool: false});
    dispatch({type: homeReducers.SET_ERROR_MESSAGES_MODAL_VISIBLE, bool: true});
  };

  const isGeoMap = (map) => {
    return !map.props.id === 'image_basemap';
  };

  // If feature is mapped on geographical map, not an image basemap or strat section
  const isOnGeoMap = (feature) => {
    return !feature.properties.image_basemap && !feature.properties.strat_section;
  };

  const saveCustomMap = async (map) => {
    let mapId = map.id;
    // Pull out mapbox styles map id
    if (map.source === 'mapbox_styles' && map.id.includes('mapbox://styles/')) {
      mapId = map.id.split('/').slice(3).join('/');
    }
    const providerInfo = getProviderInfo(map.source);
    const customMap = {...map, ...providerInfo, id: mapId, key: map.accessToken, source: map.source};
    const tileUrl = buildTileUrl(customMap);
    let testTileUrl = tileUrl.replace(/({z}\/{x}\/{y})/, '0/0/0');
    if (map.source === 'map_warper') testTileUrl = 'https://strabospot.org/map_warper_check/' + map.id;
    if (map.source === 'strabospot_mymaps') testTileUrl = 'https://strabospot.org/strabo_mymaps_check/' + map.id;
    console.log('Custom Map:', customMap, 'Test Tile URL:', testTileUrl);

    const testUrlResponse = await useServerRequests.testCustomMapUrl(testTileUrl);
    if (testUrlResponse) {
      if (map.overlay && map.id === currentBasemap.id) {
        console.log(('Setting Basemap to Mapbox Topo...'));
        setCurrentBasemap(null);
      }
      return customMap;
    }
  };

  // Create a point feature at the current location
  const setPointAtCurrentLocation = async () => {
    const userLocationCoords = await getCurrentLocation();
    let feature = turf.point(userLocationCoords);
    const newSpot = await useSpots.createSpot(feature);
    setSelectedSpot(newSpot);
    return Promise.resolve(newSpot);
  };

  const setCurrentBasemap = (mapId) => {
    if (!mapId) mapId = 'mapbox.outdoors';
    const newBasemap = basemaps.find(basemap => basemap.id === mapId);
    console.log('Setting current basemap to a default basemap...');
    dispatch({type: mapReducers.CURRENT_BASEMAP, basemap: newBasemap});
  };

  const setCustomMapSwitchValue = (value, map) => {
    console.log('value', value, 'id', map.mapId);
    const customMapsCopy = {...customMaps};
    customMapsCopy[map.id].isViewable = value;
    dispatch({type: mapReducers.ADD_CUSTOM_MAP, customMap: customMapsCopy[map.id]});
    if (!customMapsCopy[map.id].overlay) viewCustomMap(map);
  };

  const setSelectedSpot = (spotToSetAsSelected) => {
    console.log('Set selected Spot:', spotToSetAsSelected);
    dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: spotToSetAsSelected});
  };

  const viewCustomMap = (map) => {
    console.log('Setting current basemap to a custom basemap...');
    dispatch({type: mapReducers.CURRENT_BASEMAP, basemap: map});
  };

  const zoomToSpots = async (spots, map, camera) => {
    var spotsCopy = spots.map(spot => JSON.parse(JSON.stringify(spot)));
    if (currentImageBasemap) spotsCopy.map(spot => convertImagePixelsToLatLong(spot));
    if (camera) {
      try {
        if (spots.length === 1) {
          const centroid = turf.centroid(spotsCopy[0]);
          camera.flyTo(turf.getCoord(centroid));
        }
        else if (spots.length > 1) {
          const features = turf.featureCollection(spotsCopy);
          const [minX, minY, maxX, maxY] = turf.bbox(features);  //bbox extent in minX, minY, maxX, maxY order
          camera.fitBounds([maxX, minY], [minX, maxY], 100, 2500);
        }
      }
      catch (err) {
        throw Error('Error Zooming To Extent of Spots', err);
      }
    }
    else throw Error('Error Getting Map Camera');
  };

  return [{
    buildTileUrl: buildTileUrl,
    convertCoordinateProjections: convertCoordinateProjections,
    convertFeatureGeometryToImagePixels: convertFeatureGeometryToImagePixels,
    convertImagePixelsToLatLong: convertImagePixelsToLatLong,
    customMapDetails: customMapDetails,
    deleteMap: deleteMap,
    getCoordQuad: getCoordQuad,
    getCurrentLocation: getCurrentLocation,
    getDisplayedSpots: getDisplayedSpots,
    getSpotsAsFeatures: getSpotsAsFeatures,
    handleError: handleError,
    isGeoMap: isGeoMap,
    isOnGeoMap: isOnGeoMap,
    saveCustomMap: saveCustomMap,
    setCurrentBasemap: setCurrentBasemap,
    setCustomMapSwitchValue: setCustomMapSwitchValue,
    setPointAtCurrentLocation: setPointAtCurrentLocation,
    setSelectedSpot: setSelectedSpot,
    viewCustomMap: viewCustomMap,
    zoomToSpots: zoomToSpots,
  }];
};

export default useMaps;
