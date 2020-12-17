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
  },
});

export const {
  addedMapsFromDevice,
  deletedOfflineMap,
  setOfflineMap,
} = offlineMapsSlice.actions;

export default offlineMapsSlice.reducer;
