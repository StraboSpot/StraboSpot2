import {
  CURRENT_BASEMAP,
  FEATURE_ADD,
  FEATURE_DELETE,
  FEATURE_SELECTED,
  FEATURES_SELECTED_CLEARED,
  FEATURES_UPDATED,
  MAP
} from '../Constants';

const initialState = {
  map: {},
  currentBasemap: {},
  features: [],
  featuresSelected: [],
  selectedSpot: {}
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
      }
  }
  return state;
};

export const mapReducer = (state = initialState, action) => {
  switch (action.type) {
    case CURRENT_BASEMAP:
      console.log('Current Basemap in Reducer', action.basemap);
      return {
        ...state.map,
        currentBasemap: action.basemap
      };
    case MAP:
      return {
        ...state.map,
        map: action
      }
  }
  return state;
};

// export default homeReducer;
