import * as turf from '@turf/turf/index';
import Geolocation from '@react-native-community/geolocation';
import {useDispatch, useSelector} from 'react-redux';
import proj4 from 'proj4';

import {isEmpty, makeMapId} from '../../shared/Helpers';
import useSpotsHook from '../spots/useSpots';

// Constants
import {spotReducers} from '../spots/spot.constants';
import {MAPBOX_KEY} from '../../MapboxConfig';
import {mapReducers} from './maps.constants';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {projectReducers} from '../project/project.constants';
import {Alert} from 'react-native';

const useMaps = (props) => {
  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const customMaps = useSelector(state => state.map.customMaps);
  const project = useSelector(state => state.project.project);

  const [useSpots] = useSpotsHook();

  const checkMap = async (chosenForm, map) => {
    let url, saveUrl;
    let editedMapUrl;
    if (chosenForm === 'Mapbox Styles') {
      editedMapUrl = map.id.split('/').slice(3).join('/');
    }// Needs to be modified for url and saveUrl
    else if (chosenForm === 'Map Warper') editedMapUrl = map.id;
    // const {id} = state;
    // let mapIdEdit = id.split('/').slice(3).join('/'); // Needs to be modified for url and saveUrl
    // console.log(mapIdEdit)
    // setShowSubmitButton(true);
    console.log('Chosen Form', chosenForm, 'EditedURL', editedMapUrl)
    switch (chosenForm) {
      case 'Mapbox Styles':
        //jasonash/cjl3xdv9h22j12tqfmyce22zq
        //pk.eyJ1IjoiamFzb25hc2giLCJhIjoiY2l2dTUycmNyMDBrZjJ5bzBhaHgxaGQ1diJ9.O2UUsedIcg1U7w473A5UHA
        url = 'https://api.mapbox.com/styles/v1/' + editedMapUrl + '/tiles/256/0/0/0?access_token=' + map.accessToken;
        saveUrl = 'https://api.mapbox.com/styles/v1/' + editedMapUrl + '/tiles/256/{z}/{x}/{y}?access_token=' + map.accessToken;
        break;
      case 'Map Warper':
        url = 'https://www.strabospot.org/mwproxy/' + editedMapUrl + '/0/0/0.png';
        saveUrl = 'https://www.strabospot.org/mwproxy/' + editedMapUrl + '/{z}/{x}/{y}.png';
        break;
      case 'StraboSpot MyMaps':
        //5b7597c754016
        //https://strabospot.org/geotiff/tiles/5b7597c754016/0/0/0.png
        url = 'https://strabospot.org/geotiff/tiles/' + map.id + '/0/0/0.png';
        saveUrl = 'https://strabospot.org/geotiff/tiles/' + map.id + '/{z}/{x}/{y}.png';
        break;
      default:
        url = 'na';
        saveUrl = 'na';
    }

    fetch(url).then(response => {
      const statusCode = response.status;
      console.log('statusCode', statusCode);
      console.log('customMaps: ', customMaps);
      if (statusCode === 200) {
        let customMapsArr = Object.values(customMaps);
        //check to see if it already exists in Redux
        let mapExists = false;
        for (let i = 0; i < customMapsArr.length; i++) {
          console.log(Object.values(customMaps))
          if (customMapsArr[i].id === map.id) {
            mapExists = true;
          }
        }
        if (!mapExists) {
          //add map to Redux here...
          let newReduxMaps = [];
          // for (let i = 0; i < customMapsArr.length; i++) {
          //   newReduxMaps.push(customMapsArr[i]);
          // }
          let newMap = {};
          newMap.title = map.title;
          newMap.source = chosenForm;
          newMap.id = map.id;
          newMap.opacity = map.opacity;
          newMap.overlay = map.isOverlay;
          newMap.mapId = makeMapId();
          if (map.accessToken) {
            newMap.key = map.accessToken;
          }
          newMap.url = saveUrl;
          newReduxMaps.push(newMap);

          console.log(Object.assign({}, ...newReduxMaps.map(map => ({ [map.mapId]: map}))))
          const newMapObject = Object.assign({}, ...newReduxMaps.map(map => ({ [map.mapId]: map})))
          dispatch({type: mapReducers.CUSTOM_MAPS, customMaps: newMapObject});
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
        else {
          Alert.alert(
            'Failure!',
            'You have already added this map.',
            [
              {
                text: 'OK',
                // onPress: () => showHome(),
              },
            ],
            {cancelable: false},
          );
        }
      }
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
    delete projectCopy.other_maps[mapId];
    dispatch({type: mapReducers.DELETE_CUSTOM_MAP, customMaps: customMapsCopy}); // replaces customMaps with updated object
    dispatch({type: projectReducers.PROJECTS, project: projectCopy}); // Deletes map from project
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

  // Get selected and not selected Spots to display when not editing
  const getDisplayedSpots = (selectedSpots) => {
    var mappableSpots = useSpots.getMappableSpots();      // Spots with geometry
    // if image_basemap, then filter spots by imageBasemap id
    if (currentImageBasemap) mappableSpots = useSpots.getMappableSpots(currentImageBasemap.id);
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
    var bottomRight = proj4('EPSG:3857', 'EPSG:4326', [imageBasemapProps.width * 100, 0]);
    var topRight = proj4('EPSG:3857', 'EPSG:4326', [imageBasemapProps.width * 100, imageBasemapProps.height * 100]);
    var topLeft = proj4('EPSG:3857', 'EPSG:4326', [0, imageBasemapProps.height * 100]);
    var coordQuad = [topLeft, topRight, bottomRight, bottomLeft];
    console.log('coordQuad', coordQuad);
    return coordQuad;
  };

  // Convert image x,y pixels to WGS84, assuming x,y are web mercator
  const convertImagePixelsToLatLong = (features) => {
    let convertedFeatures = [];
    features.forEach(feature => {
      if (feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates;
        feature.geometry.coordinates = proj4('EPSG:3857', 'EPSG:4326', [coords[0] * 100, coords[1] * 100]);
        convertedFeatures.push(feature);
      }
      else if (feature.geometry.type === 'Polygon') {
          let calculatedCoordinates = [];
          for (const subArray of feature.geometry.coordinates){
            for (const innerSubArray of subArray){
              let [x,y] = proj4('EPSG:3857', 'EPSG:4326', [innerSubArray[0] * 100, innerSubArray[1] * 100]);
              calculatedCoordinates.push([x,y]);
            }
          }
          feature.geometry.coordinates = [calculatedCoordinates];
          convertedFeatures.push(feature);
       }
       else {
          let calculatedCoordinates = [];
          for (const subArray of feature.geometry.coordinates){
            let [x,y] = proj4('EPSG:3857', 'EPSG:4326', [subArray[0] * 100, subArray[1] * 100]);
            calculatedCoordinates.push([x,y]);
          }
          feature.geometry.coordinates = calculatedCoordinates;
          convertedFeatures.push(feature);
        }
    });
    console.log('converted features', convertedFeatures);
    return convertedFeatures;
  };

  const setCustomMapSwitchValue = (value, ind) => {
    console.log('value', value, 'id', ind);
    const customMapsCopy = {...customMaps};
    // if (customMapsCopy.length > 1) customMapsCopy.map(map => map.isMapViewable = false);
    customMapsCopy[ind].isMapViewable = value;
    console.log(customMapsCopy);
    dispatch({type: mapReducers.CUSTOM_MAPS, customMaps: customMapsCopy});
    viewCustomMap(customMapsCopy[ind]).then(map => console.log('aaaaaaaaaaaa', map))
  };

  const viewCustomMap = async (map) => {
    let tempCurrentBasemap, mapUrl;
    console.log('viewCustomMap: ', map);

    tempCurrentBasemap =
      {
        id: 'osm',
        layerId: map.id,
        layerLabel: map.mapTitle,
        layerSaveId: map.id,
        url: map.url,
        maxZoom: 19,
      };

    await dispatch({type: mapReducers.CURRENT_BASEMAP, basemap: tempCurrentBasemap});

    if (map.url === undefined) {
      if (map.source === 'Mapbox Styles' || map.source === 'mapbox_styles') {
        mapUrl = 'https://api.mapbox.com/styles/v1/' + map.id + '/tiles/256/{z}/{x}/{y}?access_token=' + MAPBOX_KEY;
      }
      else if (map.source === 'Map Warper' || map.source === 'map_warper') mapUrl = 'https://www.strabospot.org/mwproxy/' + map.id + '/{z}/{x}/{y}.png';
    }
    else {
      mapUrl = map.url;
    }

    tempCurrentBasemap =
      {
        id: 'custom',
        layerId: map.id,
        layerLabel: map.mapTitle,
        layerSaveId: map.id,
        url: mapUrl,
        maxZoom: 19,
      };

    console.log('tempCurrentBasemap: ', tempCurrentBasemap);
    await dispatch({type: mapReducers.CURRENT_BASEMAP, basemap: tempCurrentBasemap});
    // closeSettingsDrawer();
  };

  return [{
    checkMap: checkMap,
    deleteMap: deleteMap,
    editCustomMap: editCustomMap,
    getCurrentLocation: getCurrentLocation,
    getDisplayedSpots: getDisplayedSpots,
    setPointAtCurrentLocation: setPointAtCurrentLocation,
    setSelectedSpot: setSelectedSpot,
    getCoordQuad: getCoordQuad,
    convertImagePixelsToLatLong: convertImagePixelsToLatLong,
    setCustomMapSwitchValue: setCustomMapSwitchValue,
    viewCustomMap: viewCustomMap,
  }];
};

export default useMaps;
