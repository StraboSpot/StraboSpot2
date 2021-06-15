import {createSlice} from '@reduxjs/toolkit';

const initialHomeState = {
  statusMessages: [],
  imageProgress: {
    imagesDownloadedCount: 0,
    neededImageIds: 0,
  },
  isOnline: true,
  loading: {
    modal: false,
    home: false,
  },
  isSignedIn: false,
  modalValues: {},
  modalVisible: null,
  isBackupModalVisible: false,
  isBackupOverwriteModalVisible: false,
  isStatusMessagesModalVisible: false,
  isErrorMessagesModalVisible: false,
  isProjectLoadSelectionModalVisible: false,
  isOfflineMapModalVisible: false,
  isInfoModalVisible: false,
  isImageModalVisible: false,
  isMainMenuPanelVisible: false,
  isUploadModalVisible: false,
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
      state.statusMessages.push(action.payload);
    },
    clearedStatusMessages(state) {
      state.statusMessages = [];
    },
    removedLastStatusMessage(state) {
      state.statusMessages = state.statusMessages.slice(0, -1);
    },
    setBackupModalVisible(state, action) {
      state.isBackupModalVisible = action.payload;
    },
    setBackupOverwriteModalVisible(state, action) {
      state.isBackupOverwriteModalVisible = action.payload;
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
    setModalValues(state, action) {
      state.modalValues = action.payload;
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
    setUploadModalVisible(state, action) {
      state.isUploadModalVisible = action.payload;
    },
  },
});

export const {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setBackupModalVisible,
  setBackupOverwriteModalVisible,
  setErrorMessagesModalVisible,
  setImageModalVisible,
  setInfoMessagesModalVisible,
  setLoadingStatus,
  setMainMenuPanelVisible,
  setModalValues,
  setModalVisible,
  setOfflineMapsModalVisible,
  setOnlineStatus,
  setProjectLoadComplete,
  setProjectLoadSelectionModalVisible,
  setSignedInStatus,
  setStatusMessagesModalVisible,
  shortcutSwitchPosition,
  setUploadModalVisible,
} = homeSlice.actions;

export default homeSlice.reducer;
