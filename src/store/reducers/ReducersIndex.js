import {
  CURRENT_BASEMAP,
  EDIT_SPOT_PROPERTIES,
  EDIT_SPOT_GEOMETRY,
  FEATURE_ADD,
  FEATURE_DELETE,
  FEATURE_SELECTED,
  FEATURES_SELECTED_CLEARED,
  FEATURES_UPDATED,
  MAP,
  OFFLINE_MAPS,
  SPOTPAGE_VISIBLE
} from '../Constants';

const initialState = {
  map: {},
  currentBasemap: {},
  features: [],
  featuresSelected: [],
  offlineMaps: [],
  selectedSpot: {},
  isSpotPageVisible: false
};

export const homeReducer = (state = initialState, action) => {
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
    case FEATURES_UPDATED:
      console.log('FEATURES UPDATED', action.features);
      return {
        ...state,
        features: action.features
      };
    case EDIT_SPOT_PROPERTIES:
      console.log('EDITSPOT', action);
      const selectedFeatureID = state.selectedSpot.properties.id;
      // console.log('ID', selectedFeatureID);
      const updatedSpot = {
        ...state.selectedSpot,
        properties: {
          ...state.selectedSpot.properties,
          [action.field]: action.value
        }
      };
      let filteredSpots = state.features.filter(el => el.properties.id !== selectedFeatureID);
      filteredSpots.push(updatedSpot);
      return {
        ...state,
        selectedSpot: updatedSpot,
        features: filteredSpots
      };
    case EDIT_SPOT_GEOMETRY:
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
    case SPOTPAGE_VISIBLE:
      console.log('Spot Page Visible is set to:', action.visible )
      return {
        ...state,
        isSpotPageVisible: action.visible
      }
    case OFFLINE_MAPS:
      console.log('Setting offline maps: ', action.offlineMaps);
      return {
        ...state,
        offlineMaps: action.offlineMaps,
      };
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
