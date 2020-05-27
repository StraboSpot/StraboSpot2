import * as turf from '@turf/turf/index';
import Geolocation from '@react-native-community/geolocation';
import {useDispatch, useSelector} from 'react-redux';
import proj4 from 'proj4';

import {isEmpty, makeMapId} from '../../shared/Helpers';
import useSpotsHook from '../spots/useSpots';

// Constants
import {spotReducers} from '../spots/spot.constants';
import {MAPBOX_KEY} from '../../MapboxConfig';
import {
  basemaps1,
  customMapTypes,
  mapReducers,
  geoLatLngProjection,
  pixelProjection,
  mapProviders,
} from './maps.constants';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {projectReducers} from '../project/project.constants';
import {Alert} from 'react-native';
// import {mainMenuPanelReducer} from '../main-menu-panel/mainMenuPanel.reducer';
import {homeReducers} from '../home/home.constants';

const useMaps = (props) => {
  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const customMaps = useSelector(state => state.map.customMaps);
  const project = useSelector(state => state.project.project);

  const [useSpots] = useSpotsHook();

  const buildUrl = (basemap, id) => {
    let url = basemap.url[Math.floor(Math.random() * basemap.url.length)];
    if (basemap.source === 'osm') {
      url = url + basemap.tilePath;
    }
    else if (basemap.source === 'mapbox_styles') {
      url = url + basemap.id + basemap.tilePath + '?access_token=' + basemap.key;
    }
    // else if (basemap.id === 'custom') {
    //   let mapIdEdit = basemap.layerId.split('/').slice(3).join('/'); // Needs to be modified for url and saveUrl
    //   console.log(mapIdEdit)
    //   if (basemap.source === 'Mapbox Styles' || basemap.source === 'mapbox_styles') {
    //     url = 'https://api.mapbox.com/styles/v1/' + basemap.id + '/tiles/256/{z}/{x}/{y}?access_token=' + MAPBOX_KEY;
    //   }
    //   else if (basemap.source === 'Map Warper' || basemap.source === 'map_warper') url = 'https://www.strabospot.org/mwproxy/' + basemap.id + '/{z}/{x}/{y}.png';
    //   // }
    //   url = basemap.url;
    // }
    else {
      url = url + basemap.id + basemap.tilePath + (basemap.key ? '?access_token=' + basemap.key : '');
    }
    return url;
  };

  const checkMap = async (source, map) => {
    let saveUrl;
    let mapId = map.id;
    if (source === 'mapbox_styles') mapId = map.id.split('/').slice(3).join('/'); // Needs to be modified for url and saveUrl
    // else if (source === 'map_warper') mapId = map.id;
    const providerInfo = getProviderInfo(source);
    // const mapType = customMapTypes.find(mapType => mapType.source === source);
    const customMap = {...map, ...providerInfo, id: mapId, key: map.accessToken, source: source};
    const url = buildUrl(customMap);
    const testUrl = url.replace(/({z}\/{x}\/{y})/, '0/0/0')
    console.log('URL', testUrl);
    // const {id} = state;
    // let mapIdEdit = id.split('/').slice(3).join('/'); // Needs to be modified for url and saveUrl
    // console.log(mapIdEdit)
    // setShowSubmitButton(true);
    console.log('Chosen Form', source, 'EditedURL', mapId);
    // switch (chosenForm) {
    //   case 'Mapbox Styles':
    //     //jasonash/cjl3xdv9h22j12tqfmyce22zq
    //     //pk.eyJ1IjoiamFzb25hc2giLCJhIjoiY2l2dTUycmNyMDBrZjJ5bzBhaHgxaGQ1diJ9.O2UUsedIcg1U7w473A5UHA
    //     url = 'https://api.mapbox.com/styles/v1/' + editedMapUrl + '/tiles/256/0/0/0?access_token=' + map.accessToken;
    //     saveUrl = 'https://api.mapbox.com/styles/v1/' + editedMapUrl + '/tiles/256/{z}/{x}/{y}?access_token=' + map.accessToken;
    //     break;
    //   case 'Map Warper':
    //     url = 'https://www.strabospot.org/mwproxy/' + editedMapUrl + '/0/0/0.png';
    //     saveUrl = 'https://www.strabospot.org/mwproxy/' + editedMapUrl + '/{z}/{x}/{y}.png';
    //     break;
    //   case 'StraboSpot MyMaps':
    //     //5b7597c754016
    //     //https://strabospot.org/geotiff/tiles/5b7597c754016/0/0/0.png
    //     url = 'https://strabospot.org/geotiff/tiles/' + map.id + '/0/0/0.png';
    //     saveUrl = 'https://strabospot.org/geotiff/tiles/' + map.id + '/{z}/{x}/{y}.png';
    //     break;
    //   default:
    //     url = 'na';
    //     saveUrl = 'na';
    // }

    fetch(testUrl).then(response => {
      const statusCode = response.status;
      console.log('statusCode', statusCode);
      console.log('customMaps: ', customMaps);
      if (statusCode === 200) {
        // let customMapsArr = Object.values(customMaps);
        //    //check to see if it already exists in Redux
        //    let mapExists = false;
        //    for (let i = 0; i < customMapsArr.length; i++) {
        //      console.log(Object.values(customMaps));
        //      if (customMapsArr[i].id === map.id) {
        //        mapExists = true;
        //      }
        //    }
        //    if (!mapExists) {
        //      //add map to Redux here...
        //      let newReduxMaps = [];
        //      // for (let i = 0; i < customMapsArr.length; i++) {
        //      //   newReduxMaps.push(customMapsArr[i]);
        //      // }
        //      let newMap = {};
        //      newMap.title = map.title;
        //      newMap.source = source;
        //      newMap.id = map.id;
        //      newMap.opacity = map.opacity;
        //      newMap.overlay = map.isOverlay;
        //      newMap.mapId = makeMapId();
        //      if (map.accessToken) {
        //        newMap.key = map.accessToken;
        //      }
        //      newMap.url = url;
        //      newReduxMaps.push(newMap);

        // console.log(Object.assign({}, ...newReduxMaps.map(map => ({[map.id]: map}))));
        // const newMapObject = Object.assign({}, ...newReduxMaps.map(map => ({[map.id]: map})));
        dispatch({type: mapReducers.ADD_CUSTOM_MAP, customMap: customMap});
        dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
        dispatch({type: homeReducers.SET_SETTINGS_PANEL_VISIBLE, bool: false});
        Alert.alert(
          'Success!',
          'Map has been added successfully.',
          [
            {
              text: 'OK',
              // onPress: () => showHome(),
            },
          ],
          {cancelable: false},
        );
      }
      //   else {
      //     Alert.alert(
      //       'Failure!',
      //       'You have already added this map.',
      //       [
      //         {
      //           text: 'OK',
      //           // onPress: () => showHome(),
      //         },
      //       ],
      //       {cancelable: false},
      //     );
      //   }
      // }
      else {
        Alert.alert(
          'Failure!',
          'Provided map is not valid.',
          [
            {
              text: 'OK',
            },
          ],
          {cancelable: false},
        );
      }
    })
      .catch(error => {
        console.log('Error!: ', error);
        Alert.alert(
          'Failure!',
          'Provided map is not valid...',
          [
            {
              text: 'OK',
            },
          ],
          {cancelable: false},
        );
      });
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
    console.log('Saved customMaps to Redux.');
  };

  const editCustomMap = (map) => {
    dispatch({type: mapReducers.SELECTED_CUSTOM_MAP_TO_EDIT, customMap: map});
    dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, view: 'editCustomMap', bool: true});
  };

  // Create a point feature at the current location
  const setPointAtCurrentLocation = async () => {
    const userLocationCoords = await getCurrentLocation();
    let feature = turf.point(userLocationCoords);
    const newSpot = await useSpots.createSpot(feature);
    setSelectedSpot(newSpot);
    return Promise.resolve(newSpot);
    // throw Error('Geolocation Error');
  };

  // Get the current location from the device and set it in the state
  const getCurrentLocation = async () => {
    const geolocationOptions = {timeout: 15000, maximumAge: 10000, enableHighAccuracy: true};
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          // setUserLocationCoords([position.coords.longitude, position.coords.latitude]);
          console.log('Got Current Location: [', position.coords.longitude, ', ', position.coords.latitude, ']');
          resolve([position.coords.longitude, position.coords.latitude]);
        },
        (error) => reject('Error getting current location:', error),
        geolocationOptions,
      );
    });
  };

  const getCustomMapSrc = (map) => {
    let mapUrl;
    // if (map.url) {
    //   mapUrl = map.url;
    // }
    // else {
      if (map.source === 'Mapbox Styles' || map.source === 'mapbox_styles') {
        mapUrl = 'https://api.mapbox.com/styles/v1/' + map.id + '/tiles/256/{z}/{x}/{y}?access_token=' + MAPBOX_KEY;
      }
      else if (map.source === 'Map Warper' || map.source === 'map_warper') mapUrl = 'https://www.strabospot.org/mwproxy/' + map.id + '/{z}/{x}/{y}.png';
    // }
    return mapUrl;
  };

  // Get selected and not selected Spots to display when not editing
  const getDisplayedSpots = (selectedSpots) => {
    var mappableSpots = useSpots.getMappableSpots();      // Spots with geometry
    // if image_basemap, then filter spots by imageBasemap id
    if (currentImageBasemap) mappableSpots = useSpots.getMappableSpots();
    // Filter out Spots on an strat section
    var displayedSpots = mappableSpots.filter(spot => !spot.properties.strat_section);
    // Filter out Spots on an image_basemap
    if (!currentImageBasemap) displayedSpots = displayedSpots.filter(spot => !spot.properties.image_basemap);
    console.log('Mappable Spots', selectedSpots);

    let mappedFeatures = [];
    displayedSpots.map(spot => {
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

    // Separate selected Spots and not selected Spots (Point Spots need to in both
    // selected and not selected since the selected symbology is a halo around the point)
    const selectedIds = selectedSpots.map(sel => sel.properties.id);
    const selectedDisplayedSpots = displayedSpots.filter(spot => selectedIds.includes(spot.properties.id));
    const notSelectedDisplayedSpots = mappedFeatures.filter(spot => !selectedIds.includes(spot.properties.id) ||
      spot.geometry.type === 'Point');

    console.log('Selected Spots to Display on this Map:', selectedDisplayedSpots);
    console.log('Not Selected Spots to Display on this Map:', notSelectedDisplayedSpots);
    return [selectedDisplayedSpots, notSelectedDisplayedSpots];
  };

  const getProviderInfo = (source) => {
    console.log(mapProviders[source]);
    return mapProviders[source];
  };

  const setSelectedSpot = (spotToSetAsSelected) => {
    console.log('Set selected Spot:', spotToSetAsSelected);
    let [selectedSpots, notSelectedSpots] = getDisplayedSpots(
      isEmpty(spotToSetAsSelected) ? [] : [{...spotToSetAsSelected}]);
    dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: spotToSetAsSelected});
    return [selectedSpots, notSelectedSpots];
  };

  /* getCoordQuad method identifies the coordinate span for the
   for the image basemap.
   */
  const getCoordQuad = (imageBasemapProps) => {
    // identify the [lat,lng] corners of the image basemap
    var bottomLeft = [0, 0];
    var bottomRight = convertCoordinateProjections(pixelProjection,geoLatLngProjection, [imageBasemapProps.width, 0]);
    var topRight = convertCoordinateProjections(pixelProjection,geoLatLngProjection, [imageBasemapProps.width, imageBasemapProps.height]);
    var topLeft = convertCoordinateProjections(pixelProjection,geoLatLngProjection, [0, imageBasemapProps.height]);
    var coordQuad = [topLeft, topRight, bottomRight, bottomLeft];
    console.log('The coordinates identified for image-basemap :', coordQuad);
    return coordQuad;
  };

  // Convert image x,y pixels to WGS84, assuming x,y are web mercator
  const convertImagePixelsToLatLong = (feature) => {
      if (feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates;
        feature.geometry.coordinates = convertCoordinateProjections(pixelProjection,geoLatLngProjection, [coords[0], coords[1]]);
      }
      else if (feature.geometry.type === 'Polygon') {
          let calculatedCoordinates = [];
          for (const subArray of feature.geometry.coordinates){
            for (const innerSubArray of subArray){
              let [x,y] = convertCoordinateProjections(pixelProjection,geoLatLngProjection, [innerSubArray[0], innerSubArray[1]]);
              calculatedCoordinates.push([x,y]);
            }
          }
          feature.geometry.coordinates = [calculatedCoordinates];
       }
       else {
          let calculatedCoordinates = [];
          for (const subArray of feature.geometry.coordinates){
            let [x,y] = convertCoordinateProjections(pixelProjection,geoLatLngProjection, [subArray[0], subArray[1]]);
            calculatedCoordinates.push([x,y]);
          }
          feature.geometry.coordinates = calculatedCoordinates;
        }
        return feature;
  };

  // Convert WGS84 to image x,y pixels, assuming x,y are web mercator
  const convertFeatureGeometryToImagePixels = (feature) => {
    var imageX,imageY;
    let calculatedCoordinates = [];
    if (feature.geometry.type === 'Point') {
      [imageX,imageY] = convertCoordinateProjections(geoLatLngProjection, pixelProjection, feature.geometry.coordinates);
      feature.geometry.coordinates = [imageX,imageY];
    }
    else if (feature.geometry.type === 'Polygon') {
      for (const subArray of feature.geometry.coordinates){
        for (const innerSubArray of subArray){
          [imageX,imageY] = convertCoordinateProjections(geoLatLngProjection, pixelProjection, innerSubArray);
          calculatedCoordinates.push([imageX,imageY]);
        }
      }
      feature.geometry.coordinates = [calculatedCoordinates];
    }
    else { // LineString
      for (const subArray of feature.geometry.coordinates){
        [imageX,imageY] = convertCoordinateProjections(geoLatLngProjection, pixelProjection,  subArray);
        calculatedCoordinates.push([imageX,imageY]);
      }
      feature.geometry.coordinates = calculatedCoordinates;
    }
    return feature;
  };

  const convertCoordinateProjections = (sourceProjection, targetProjection, coords) => {
    const [targetX,targetY] = proj4(sourceProjection, targetProjection, coords);
    return [targetX,targetY];
  };

  const setCurrentBasemap = (mapId) => {
    if (!mapId) mapId = 'mapbox.outdoors';
    const currentBasemap =  basemaps1.find(basemap => basemap.id === mapId);
    console.log('Current Base Map', currentBasemap)
    dispatch({type: mapReducers.CURRENT_BASEMAP, basemap: currentBasemap});
  };

  const setCustomMapSwitchValue = (value, map) => {
    console.log('value', value, 'id', map.mapId);
    const customMapsCopy = {...customMaps};
    // if (customMapsCopy.length > 1) customMapsCopy.map(map => map.isViewable = false);
    customMapsCopy[map.mapId].isViewable = value;
    dispatch({type: mapReducers.CUSTOM_MAPS, customMaps: customMapsCopy});
    if (!customMapsCopy[map.mapId].overlay) viewCustomMap(map);
  };

  const viewCustomMap = (map) => {
    let tempCurrentBasemap;
    console.log('viewCustomMap: ', map);
    // if (customMaps[map.mapId].isViewable) {
    //   tempCurrentBasemap =
    //     {
    //       id: 'osm',
    //       layerId: map.id,
    //       layerLabel: map.title,
    //       layerSaveId: map.id,
    //       url: map.url,
    //       maxZoom: 19,
    //     };
    //
    //   dispatch({type: mapReducers.CURRENT_BASEMAP, basemap: tempCurrentBasemap});
   // const editedMapUrl = map.id.split('/').slice(3).join('/');
   //  const providerInfo = await getProviderInfo(map.source);
   //  const mapType = customMapTypes.find(customMap => {
   //    return customMap.source === map.source;
   //  });
   //  const url = buildUrl({...mapType, ...providerInfo, id: editedMapUrl, key: map.key});
   //
   //  tempCurrentBasemap =
   //    {
   //      id: 'custom',
   //      source: map.source,
   //      layerId: editedMapUrl,
   //      layerLabel: map.title,
   //      layerSaveId: map.id,
   //      url: [url],
   //      maxZoom: 19,
   //    };
   //
     console.log('tempCurrentBasemap: ', map);
    dispatch({type: mapReducers.CURRENT_BASEMAP, basemap: map});
    // closeSettingsDrawer();
  };

  return [{
    buildUrl: buildUrl,
    checkMap: checkMap,
    deleteMap: deleteMap,
    convertCoordinateProjections: convertCoordinateProjections,
    editCustomMap: editCustomMap,
    getCurrentLocation: getCurrentLocation,
    getCustomMapSrc: getCustomMapSrc,
    getDisplayedSpots: getDisplayedSpots,
    setPointAtCurrentLocation: setPointAtCurrentLocation,
    setSelectedSpot: setSelectedSpot,
    getCoordQuad: getCoordQuad,
    convertImagePixelsToLatLong: convertImagePixelsToLatLong,
    setCurrentBasemap: setCurrentBasemap,
    setCustomMapSwitchValue: setCustomMapSwitchValue,
    viewCustomMap: viewCustomMap,
    convertFeatureGeometryToImagePixels: convertFeatureGeometryToImagePixels,
  }];
};

export default useMaps;
