import {Dimensions} from 'react-native';

import {createSlice} from '@reduxjs/toolkit';

const initialHomeState = {
  statusMessages: [],
  imageProgress: {
    imagesDownloadedCount: 0,
    neededImageIds: 0,
  },
  isOnline: false,
  loading: {
    modal: false,
    home: false,
  },
  isSignedIn: false,
  modalVisible: null,
  isStatusMessagesModalVisible: false,
  isErrorMessagesModalVisible: false,
  isProjectLoadSelectionModalVisible: false,
  isOfflineMapModalVisible: false,
  isInfoModalVisible: false,
  isImageModalVisible: false,
  isAllSpotsPanelVisible: false,
  isMainMenuPanelVisible: false,
  deviceDimensions: Dimensions.get('window'),
  shortcutSwitchPosition: {
    Tag: false,
    Measurement: false,
    Sample: false,
    Note: false,
    Photo: false,
    Sketch: false,
  },
  isProjectLoadComplete: false,
};

// createSlice combines reducers, actions, and constants
const homeSlice = createSlice({
  name: 'home',
  initialState: initialHomeState,
  reducers: {
    addedStatusMessage(state, action) {
      state.statusMessages.push(action.payload.statusMessage);
    },
    clearedStatusMessages(state) {
      state.statusMessages = [];
    },
    gotDeviceDimensions(state, action) {
      state.deviceDimensions = action.payload.dims;
    },
    removedLastStatusMessage(state) {
      state.statusMessages = state.statusMessages.slice(0, -1);
    },
    setAllSpotsPanelVisible(state, action) {
      state.isAllSpotsPanelVisible = action.payload;
    },
    setErrorMessagesModalVisible(state, action) {
      state.isErrorMessagesModalVisible = action.payload;
    },
    setImageModalVisible(state, action) {
      state.isImageModalVisible = action.payload;
    },
    setInfoMessagesModalVisible(state, action) {
      state.isInfoModalVisible = action.payload;
    },
    setLoadingStatus(state, action) {
      const {bool, view} = action.payload;
      state.loading[view] = bool;
    },
    setMainMenuPanelVisible(state, action) {
      state.isMainMenuPanelVisible = action.payload;
    },
    setModalVisible(state, action) {
      state.modalVisible = action.payload.modal;
    },
    setOfflineMapsModalVisible(state, action) {
      state.isOfflineMapModalVisible = action.payload;
    },
    setOnlineStatus(state, action) {
      state.isOnline = action.payload;
    },
    setProjectLoadComplete(state, action) {
      state.isProjectLoadComplete = action.payload;
    },
    setProjectLoadSelectionModalVisible(state, action) {
      state.isProjectLoadSelectionModalVisible = action.payload;
    },
    setSignedInStatus(state, action) {
      state.isSignedIn = action.payload;
    },
    setStatusMessagesModalVisible(state, action) {
      state.isStatusMessagesModalVisible = action.payload;
    },
    shortcutSwitchPosition(state, action) {
      state.shortcutSwitchPosition[action.payload.switchName] = !state.shortcutSwitchPosition[action.payload.switchName];
    },
  },
});

export const {
  addedStatusMessage,
  clearedStatusMessages,
  gotDeviceDimensions,
  removedLastStatusMessage,
  setAllSpotsPanelVisible,
  setErrorMessagesModalVisible,
  setImageModalVisible,
  setInfoMessagesModalVisible,
  setLoadingStatus,
  setMainMenuPanelVisible,
  setModalVisible,
  setOfflineMapsModalVisible,
  setOnlineStatus,
  setProjectLoadComplete,
  setProjectLoadSelectionModalVisible,
  setSignedInStatus,
  setStatusMessagesModalVisible,
  shortcutSwitchPosition,
} = homeSlice.actions;

export default homeSlice.reducer;
