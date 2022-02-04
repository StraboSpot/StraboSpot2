import {createSlice} from '@reduxjs/toolkit';

import {isEmpty} from '../../../shared/Helpers';

const initialOfflineMapsState = {
  offlineMaps: {},
};

const offlineMapsSlice = createSlice({
  name: 'offlineMaps',
  initialState: initialOfflineMapsState,
  reducers: {
    addedMapsFromDevice(state, action) {
      const {mapType, maps} = action.payload;
      state[mapType] = maps;
    },
    deletedOfflineMap(state, action) {
      delete state.offlineMaps[action.payload];
    },
    setOfflineMap(state, action) {
      console.log('Setting offline maps: ', action.payload);
      if (isEmpty(action.payload)) state.offlineMaps = initialOfflineMapsState.offlineMaps;
      else state.offlineMaps = {...state.offlineMaps, ...action.payload};
    },
    setOfflineMapVisible(state, action) {
      const {mapId, viewable} = action.payload;
      const toggleFalse = Object.values(state.offlineMaps).map(offlineMap => {
        offlineMap.isOfflineMapVisible = false;
        return offlineMap;
      });
      console.log(toggleFalse);
      state.offlineMaps[mapId] = {...state.offlineMaps[mapId], isOfflineMapVisible: viewable};
    },
    updateOfflineMaps(state, action) {
      // if (!isEmpty(Object.values(state.offlineMaps))) state.offlineMaps = {...state.offlineMaps, ...action.payload};
      state.offlineMaps = action.payload;
    },
  },
});

export const {
  addedMapsFromDevice,
  deletedOfflineMap,
  setOfflineMap,
  setOfflineMapVisible,
  updateOfflineMaps,
} = offlineMapsSlice.actions;

export default offlineMapsSlice.reducer;
