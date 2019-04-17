import {FEATURE_SELECTED, FEATURE_ADD} from '../Constants';
import MapboxGL from "@mapbox/react-native-mapbox-gl";

const initialState = {
  selectedSpot: {},
  featureCollectionSelected: MapboxGL.geoUtils.makeFeatureCollection(),
  featureCollection: MapboxGL.geoUtils.makeFeatureCollection(),
};

export const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case FEATURE_SELECTED:
      // console.log('FEATURE_SELECTED', action.feature);
      const updatedFeature = action.feature;
      return {
        ...state,
        selectedSpot: updatedFeature.features[0],
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

// export default homeReducer;
