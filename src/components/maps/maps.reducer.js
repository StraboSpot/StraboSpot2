import {mapReducers} from './Map.constants';

const initialState = {
  map: {},
  currentBasemap: {},
  offlineMaps: [],
  vertexSelectedCoordinates: undefined,
  vertexDropPoints: undefined
};

export const mapReducer = (state = initialState, action) => {
  switch (action.type) {
    case mapReducers.CURRENT_BASEMAP:
      // console.log('Current Basemap in Reducer', action.basemap);
      return {
        ...state.map,
        currentBasemap: action.basemap
      };
    case mapReducers.MAP:
      return {
        ...state.map,
        map: action
      };
    case mapReducers.CUSTOM_MAPS:
      console.log('Setting custom maps: ', action.customMaps);
      return {
        ...state,
        customMaps: action.customMaps,
      };
    case mapReducers.OFFLINE_MAPS:
      console.log('Setting offline maps: ', action.offlineMaps);
      return {
        ...state,
        offlineMaps: action.offlineMaps,
      };
    case mapReducers.DELETE_OFFLINE_MAP:
      console.log('Deleting Offline Map: ', action.offlineMap);
      return {
        state
      };
    case mapReducers.VERTEX_SELECTED:
      console.log('Vertex Selected: ', action.vertexSelectedCoordinates);
      return {
        ...state,
        vertexSelectedCoordinates: action.vertexSelectedCoordinates,
      };
    case mapReducers.VERTEX_DROP_POINTS:
      return {
        ...state,
        vertexDropPoints: action.points
      }
  }
  return state;
};
