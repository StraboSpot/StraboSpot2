import {FEATURE_SELECTED} from '../Constants';
import MapboxGL from "@mapbox/react-native-mapbox-gl";

const initialState = {
  currentSpot: [],
  featureCollectionSelected: MapboxGL.geoUtils.makeFeatureCollection(),
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
      }
  }
  return state;
}

export default homeReducer;
