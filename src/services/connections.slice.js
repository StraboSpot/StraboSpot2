import {createSlice} from '@reduxjs/toolkit';

const initialConnectionsState = {
  isOnline: {},
  databaseEndpoint: {
    url: '',
    isSelected: false,
    isVerified: false,
  },
};

const connectionsSlice = createSlice({
  name: 'connections',
  initialState: initialConnectionsState,
  reducers: {
    setOnlineStatus(state, action) {
      state.isOnline = action.payload;
    },
    setDatabaseVerify(state, action) {
      state.databaseEndpoint.isVerified = action.payload;
    },
    setDatabaseIsSelected(state, action) {
      state.databaseEndpoint.isSelected = action.payload;
    },
    setCustomDatabaseUrl(state, action) {
      state.databaseEndpoint.url = action.payload;
    },
    updatedProjectTransferProgress(state, action) {
      state.projectTransferProgress = action.payload;
    },
  },
});

export const {
  setDatabaseIsSelected,
  setDatabaseVerify,
  setCustomDatabaseUrl,
  setOnlineStatus,
  updatedProjectTransferProgress,
} = connectionsSlice.actions;

export default connectionsSlice.reducer;
