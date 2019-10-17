import {spotReducers} from "./Spot.constants";

const initialState = {
  features: [],
  featuresSelected: [],
  selectedSpot: {},
  selectedAttributes: [],
  recentViews: []
};

export const spotReducer = (state = initialState, action) => {
  let selectedFeatureID = undefined;
  const isEqual = require('lodash.isequal');

  switch (action.type) {
    case spotReducers.FEATURE_SELECTED:
      let recentViewsArr = state.recentViews;
      const index = recentViewsArr.indexOf(action.feature.properties.id);
      if (index !== -1) recentViewsArr.splice(index,1);
        recentViewsArr.unshift(action.feature.properties.id);
        if (state.recentViews.length > 20) recentViewsArr.shift();
        return {
        ...state,
        featuresSelected: [action.feature],
        selectedSpot: action.feature,
        recentViews: recentViewsArr
      };
    case spotReducers.FEATURES_SELECTED_CLEARED:
      console.log('FEATURES_SELECTED_CLEARED');
      return {
        ...state,
        featuresSelected: [],
        selectedSpot: {}
      };
    case spotReducers.FEATURE_ADD:
      console.log('ADDED', action.feature);
      return {
        ...state,
        features: [...state.features, action.feature]
      };
    case spotReducers.FEATURE_DELETE:
      console.log('DELETED', action.id);
      const updatedFeatures = state.features.filter((feature) => {
        return feature.properties.id !== action.id;
      });
      const updatedRecentViews = state.recentViews.filter(id => {
        return id !== action.id
      });
      // console.log('Deleted Feature', deletedFeature);
      return {
        ...state,
        features: updatedFeatures,
        selectedSpot: {},
        featuresSelected: [],
        recentViews: updatedRecentViews
      };
    case spotReducers.FEATURES_UPDATED:
      console.log('FEATURES UPDATED', action.features);
      return {
        ...state,
        features: action.features
      };
    case spotReducers.EDIT_SPOT_PROPERTIES:
      console.log('EDITSPOT', action);
      let updatedSpot = state.selectedSpot;
      selectedFeatureID = state.selectedSpot.properties.id;
      if (((action.value !== typeof ({}) || !Array.isArray(action.value)) && !isEqual(action.value,
        state.selectedSpot.properties[action.field]))
        || ((action.value === typeof ({}) || Array.isArray(action.value)) && !isEqual(action.value,
          state.selectedSpot.properties[action.field]))) {
        updatedSpot = {
          ...state.selectedSpot,
          properties: {
            ...state.selectedSpot.properties,
            [action.field]: action.value,
            modified_timestamp: Date.now()
          }
        };
      }
      let filteredSpots = state.features.filter(el => el.properties.id !== selectedFeatureID);
      filteredSpots.push(updatedSpot);
      return {
        ...state,
        selectedSpot: updatedSpot,
        features: filteredSpots
      };
    case spotReducers.SET_SELECTED_ATTRIBUTES:
      return {
        ...state,
        selectedAttributes: action.attributes
      };
    case spotReducers.EDIT_SPOT_IMAGES:
      let combinedImageArr = [];
      let updatedSpotImages = null;
      selectedFeatureID = state.selectedSpot.properties.id;
      console.log('EDITSPOT Image', action.image, 'ID', selectedFeatureID);
      let tempImages = [];
      if (state.selectedSpot.properties.images) tempImages = state.selectedSpot.properties.images;

      const updatedSpotObj = action.images.map(image => {
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
    case spotReducers.EDIT_SPOT_GEOMETRY:
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
      };
    case spotReducers.SET_ISONLINE:
      return {
        ...state,
        isOnline: action.online
      }
  }
  return state;
};
