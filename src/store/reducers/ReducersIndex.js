import {
  ADD_PHOTOS,
  CURRENT_BASEMAP,
  CUSTOM_MAPS,
  DELETE_PHOTOS,
  DELETE_OFFLINE_MAP,
  EDIT_SPOT_GEOMETRY,
  EDIT_SPOT_PROPERTIES,
  FEATURE_ADD,
  FEATURE_DELETE,
  FEATURE_SELECTED,
  FEATURES_SELECTED_CLEARED,
  FEATURES_UPDATED,
  MAP,
  OFFLINE_MAPS,
  SET_SPOT_PAGE_VISIBLE,
  SET_ISONLINE,
  EDIT_SPOT_IMAGES,
} from '../Constants';
import {SpotPages} from "../../components/notebook-panel/Notebook.constants";

const initialState = {
  map: {},
  currentBasemap: {},
  features: [],
  featuresSelected: [],
  offlineMaps: [],
  selectedSpot: {},
  visiblePage: SpotPages.OVERVIEW
};

const initialImageState = {
  imagePaths: {}
};

export const homeReducer = (state = initialState, action) => {
    let selectedFeatureID = undefined;

    switch (action.type) {
      case FEATURE_SELECTED:
        return {
          ...state,
          featuresSelected: [action.feature],
          selectedSpot: action.feature
        };
      case FEATURES_SELECTED_CLEARED:
        console.log('FEATURES_SELECTED_CLEARED');
        return {
          ...state,
          featuresSelected: [],
          selectedSpot: {}
        };
      case FEATURE_ADD:
        console.log('ADDED', action.feature);
        return {
          ...state,
          features: [...state.features, action.feature]
        };
      case FEATURE_DELETE:
        console.log('DELETED', action.id);
        const updatedFeatures = state.features.filter((feature) => {
          return feature.properties.id !== action.id;
        });
        // console.log('Deleted Feature', deletedFeature);
        return {
          ...state,
          features: updatedFeatures,
          selectedSpot: {},
          featuresSelected: []
        };
      case FEATURES_UPDATED:
        console.log('FEATURES UPDATED', action.features);
        return {
          ...state,
          features: action.features
        };
      case EDIT_SPOT_PROPERTIES:
        console.log('EDITSPOT', action);
        let updatedSpot = null;
        // let notesArr = [];
        selectedFeatureID = state.selectedSpot.properties.id;
        // console.log('ID', selectedFeatureID);
        // if (action.field === 'notes') {
        //   notesArr.push(action.value);
        //   updatedSpot = {
        //     ...state.selectedSpot,
        //     properties: {
        //       ...state.selectedSpot.properties,
        //       notes: {
        //         ...state.selectedSpot.properties.notes,
        //         [action.field]: notesArr
        //       }
        //     }
        //   };
        // }
        // else {
        updatedSpot = {
          ...state.selectedSpot,
          properties: {
            ...state.selectedSpot.properties,
            [action.field]: action.value
          }
        };
        // }
        let filteredSpots = state.features.filter(el => el.properties.id !== selectedFeatureID);
        filteredSpots.push(updatedSpot);
        return {
          ...state,
          selectedSpot: updatedSpot,
          features: filteredSpots
        };
      // break;
      case EDIT_SPOT_IMAGES:
        let combinedImageArr = [];
        let updatedSpotImages = null;
        selectedFeatureID = state.selectedSpot.properties.id;
        console.log('EDITSPOT Image', action.image, 'ID', selectedFeatureID);
        let tempImages = [];
        if (state.selectedSpot.properties.images) tempImages = state.selectedSpot.properties.images;

        const updatedSpotObj = action.image.map(image => {
          return {id: image.id, height: image.height, width: image.width, image_type: image.image_type}
        });
        tempImages = [...tempImages, ...updatedSpotObj];
        updatedSpotImages = {
          ...state.selectedSpot,
          properties: {
            ...state.selectedSpot.properties,
            images: tempImages
          }
        };
        let filteredSpots1 = state.features.filter(el => el.properties.id !== selectedFeatureID);
        filteredSpots1.push(updatedSpotImages);
        return {
          ...state,
          selectedSpot: updatedSpotImages,
          features: filteredSpots1
        };
      case
      EDIT_SPOT_GEOMETRY:
        console.log('EDITSPOT Geometry', action);
        return {
          ...state,
          selectedSpot: {
            ...state.selectedSpot,
            geometry: {
              ...state.selected.geometry,
              [action.field]: action.value
            }
          }
        }
      case
      CUSTOM_MAPS:
        console.log('Setting custom maps: ', action.customMaps);
        return {
          ...state,
          customMaps: action.customMaps,
        };
      case
      OFFLINE_MAPS:
        console.log('Setting offline maps: ', action.offlineMaps);
        return {
          ...state,
          offlineMaps: action.offlineMaps,
        };
      case
      DELETE_OFFLINE_MAP:
        console.log('Deleting Offline Map: ', action.offlineMap);
        return {
          state
        };
      case
      SET_ISONLINE:
        return {
          ...state,
          isOnline: action.online
        }
    }
    return state;
  }
;

export const notebookReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SPOT_PAGE_VISIBLE:
      return {
        ...state,
        visiblePage: action.page
      }
  }
  return state;
};

export const mapReducer = (state = initialState, action) => {
  switch (action.type) {
    case CURRENT_BASEMAP:
      // console.log('Current Basemap in Reducer', action.basemap);
      return {
        ...state.map,
        currentBasemap: action.basemap
      };
    case MAP:
      return {
        ...state.map,
        map: action
      };
  }
  return state;
};

export const imageReducer = (state = initialImageState, action) => {
  switch (action.type) {
    case ADD_PHOTOS:
      console.log('ADD_PHOTOS', action);
      let updatedImages = null;
      let imagePathsTemp = {};
      console.log(action.images);
      action.images.map(data => {
        imagePathsTemp[data.id] = data.src;
        // console.log('photo in reducer\n', 'ID:', data.id, '\nSRC:', data.src, '\nNAME:', data.name);
        // const {id, src} = data;

        // updatedImages = state.imagePaths.concat(imagePathsTemp)
      });
      console.log(state.imagePaths, '\n', imagePathsTemp)
      return {
        ...state,
        imagePaths: {...state.imagePaths, ...imagePathsTemp}
      }
  }
  return state;
};
