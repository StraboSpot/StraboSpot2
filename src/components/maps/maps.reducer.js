import {mapReducers} from './Map.constants';

const initialState = {
  map: {},
  currentBasemap: {},
  offlineMaps: [],
  vertexStartCoords: undefined,
  vertexEndCoords: undefined
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
    case mapReducers.VERTEX_START_COORDS:
      console.log('Vertex Selected Start Coords: ', action.vertexStartCoords);
      return {
        ...state,
        vertexStartCoords: action.vertexStartCoords,
      };
    case mapReducers.VERTEX_END_COORDS:
      console.log('Vertex Selected End Coords: ', action.vertexEndCoords);
      return {
        ...state,
        vertexEndCoords: action.vertexEndCoords
      }
  }
  return state;
};
