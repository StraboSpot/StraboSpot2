import {FEATURE_SELECTED, FEATURE_ADD} from '../Constants';
import MapboxGL from "@mapbox/react-native-mapbox-gl";

const initialState = {
  // currentSpot: [],
  featureCollectionSelected: MapboxGL.geoUtils.makeFeatureCollection(),
  featureCollection: MapboxGL.geoUtils.makeFeatureCollection(),
};

function homeReducer(state = initialState, action){
  switch(action.type){
    case FEATURE_SELECTED:
      console.log('FEATURE_SELECTED', action.feature);
      const updatedFeature = action.feature;
      console.log('FEATURE_SELECTED', updatedFeature);

      return {
        ...state,
        featureCollectionSelected: updatedFeature
      };
    case FEATURE_ADD:
      console.log('ADDED', action.feature);
      const featureCollectionUpdated = {
        // ...state,
        ...state.featureCollection
      }
      return {
        ...state,
        featureCollection: MapboxGL.geoUtils.addToFeatureCollection(featureCollectionUpdated, action.feature)
      }
  }
  return state;
}

export default homeReducer;
