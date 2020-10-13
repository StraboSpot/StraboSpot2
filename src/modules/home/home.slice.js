import {Dimensions} from 'react-native';

import {createSlice} from '@reduxjs/toolkit';

const initialHomeState = {
  statusMessages: [],
  imageProgress: {
    imagesDownloadedCount: 0,
    neededImageIds: 0,
  },
  isOnline: null,
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
      console.log('STATE>STATUSMESSAGES', state.statusMessages)
    },
    setAllSpotsPanelVisible(state, action) {
      state.isAllSpotsPanelVisible = action.payload.bool;
    },
    setErrorMessagesModalVisible(state, action) {
      state.isErrorMessagesModalVisible = action.payload.bool;
    },
    setImageModalVisible(state, action) {
      state.isImageModalVisible = action.payload.bool;
    },
    setInfoMessagesModalVisible(state, action) {
      state.isInfoModalVisible = action.payload.bool;
    },
    setLoadingStatus(state, action) {
      const {bool, view} = action.payload;
      state.loading[view] = bool;
    },
    setMainMenuPanelVisible(state, action) {
      state.isMainMenuPanelVisible = action.payload.bool;
    },
    setModalVisible(state, action) {
      state.modalVisible = action.payload.modal;
    },
    setOfflineMapsModalVisible(state, action) {
      state.isOfflineMapModalVisible = action.payload.bool;
    },
    setOnlineStatus(state, action) {
      state.isOnline = action.payload.bool;
    },
    setProjectLoadComplete(state, action) {
      state.isProjectLoadComplete = action.payload.bool;
    },
    setProjectLoadSelectionModalVisible(state, action) {
      state.isProjectLoadSelectionModalVisible = action.payload.bool;
    },
    setSignedInStatus(state, action) {
      state.isSignedIn = action.payload.bool;
    },
    setStatusMessagesModalVisible(state, action) {
      state.isStatusMessagesModalVisible = action.payload.bool;
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
