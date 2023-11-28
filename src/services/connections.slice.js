import {createSlice} from '@reduxjs/toolkit';

const initialConnectionsState = {
  isOnline: {},
  databaseEndpoint: {
    protocol: 'http://',
    domain: '',
    path: '/db',
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
    setDatabaseProtocol(state, action) {
      const {domain, path} = state.databaseEndpoint;
      state.databaseEndpoint.protocol = action.payload;
      state.databaseEndpoint.url = action.payload + domain + path;
    },
    setDatabaseDomain(state, action) {
      const {protocol, path} = state.databaseEndpoint;
      state.databaseEndpoint.domain = action.payload;
      state.databaseEndpoint.url = protocol + action.payload + path;
    },
    setDatabasePath(state, action) {
      const {protocol, domain} = state.databaseEndpoint;
      state.databaseEndpoint.path = action.payload;
      state.databaseEndpoint.url = protocol + domain + action.payload;
    },
    setDatabaseVerify(state, action) {
      state.databaseEndpoint.isVerified = action.payload;
    },
    setDatabaseIsSelected(state, action) {
      state.databaseEndpoint.isSelected = action.payload;
    },
    updatedProjectTransferProgress(state, action) {
      state.projectTransferProgress = action.payload;
    },
  },
});

export const {
  setDatabaseIsSelected,
  setDatabaseVerify,
  setDatabasePath,
  setDatabaseDomain,
  setDatabaseProtocol,
  setOnlineStatus,
  updatedProjectTransferProgress,
} = connectionsSlice.actions;

export default connectionsSlice.reducer;
