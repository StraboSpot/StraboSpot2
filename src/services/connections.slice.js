import {createSlice} from '@reduxjs/toolkit';

const initialConnectionsState = {
  isOnline: {},
  databaseEndpoint: {
    protocol: 'http://',
    domain: '',
    path: '/db',
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
    setDatabaseUrl(state, action) {
      const {protocol, domain, path} = action.payload;
      state.databaseEndpoint.protocol = protocol;
      state.databaseEndpoint.domain = domain;
      state.databaseEndpoint.path = path;
    },
    updatedProjectTransferProgress(state, action) {
      state.projectTransferProgress = action.payload;
    },
  },
});

export const {
  setDatabaseIsSelected,
  setDatabaseVerify,
  setDatabaseUrl,
  setOnlineStatus,
  updatedProjectTransferProgress,
} = connectionsSlice.actions;

export default connectionsSlice.reducer;
