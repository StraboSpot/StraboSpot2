import {createSlice} from '@reduxjs/toolkit';

const initialHomeState = {
  statusMessages: [],
  imageProgress: {
    imagesDownloadedCount: 0,
    neededImageIds: 0,
  },
  loading: {
    modal: false,
    home: false,
  },
  // isSignedIn: false,
  modalValues: {},
  modalVisible: null,
  isBackupModalVisible: false,
  isStatusMessagesModalVisible: false,
  isErrorMessagesModalVisible: false,
  isWarningMessagesModalVisible: false,
  isProgressModalVisible: false,
  isProjectLoadSelectionModalVisible: false,
  isOfflineMapModalVisible: false,
  isImageModalVisible: false,
  isMainMenuPanelVisible: false,
  isUploadModalVisible: false,
  isUploadProgressModalVisible: false,
  shortcutSwitchPosition: {
    all: false,
    tag: false,
    measurement: false,
    sample: false,
    note: false,
    photo: false,
    sketch: false,
  },
  statusMessageModalTitle: '',
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
    setErrorMessagesModalVisible(state, action) {
      state.isErrorMessagesModalVisible = action.payload;
    },
    setImageModalVisible(state, action) {
      state.isImageModalVisible = action.payload;
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
    setProgressModalVisible(state, action) {
      state.isProgressModalVisible = action.payload;
    },
    setProjectLoadComplete(state, action) {
      state.isProjectLoadComplete = action.payload;
    },
    setProjectLoadSelectionModalVisible(state, action) {
      state.isProjectLoadSelectionModalVisible = action.payload;
    },
    // setSignedInStatus(state, action) {
    //   state.isSignedIn = action.payload;
    // },
    setStatusMessagesModalVisible(state, action) {
      state.isStatusMessagesModalVisible = action.payload;
    },
    setStatusMessageModalTitle(state, action) {
      state.statusMessageModalTitle = action.payload;
    },
    setShortcutSwitchPositions(state, action) {
      console.log('Toggling Shortcut', action.payload.switchName);
      state.shortcutSwitchPosition[action.payload.switchName] = !state.shortcutSwitchPosition[action.payload.switchName];
      if (action.payload.switchName === 'all') {
        Object.keys(state.shortcutSwitchPosition).forEach(
          key => (state.shortcutSwitchPosition[key] = state.shortcutSwitchPosition.all));
      }
      else state.shortcutSwitchPosition.all = false;
      console.log('Shortcut Switch Positions', JSON.stringify(Object.entries(state.shortcutSwitchPosition)));
    },
    setUploadModalVisible(state, action) {
      state.isUploadModalVisible = action.payload;
    },
    setWarningModalVisible(state, action) {
      state.isWarningMessagesModalVisible = action.payload;
    },
  },
});

export const {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setBackupModalVisible,
  setErrorMessagesModalVisible,
  setImageModalVisible,
  setInfoMessagesModalVisible,
  setLoadingStatus,
  setMainMenuPanelVisible,
  setModalValues,
  setModalVisible,
  setOfflineMapsModalVisible,
  setProgressModalVisible,
  setProjectLoadComplete,
  setProjectLoadSelectionModalVisible,
  // setSignedInStatus,
  setStatusMessagesModalVisible,
  setStatusMessageModalTitle,
  setShortcutSwitchPositions,
  setUploadModalVisible,
  setWarningModalVisible,
} = homeSlice.actions;

export default homeSlice.reducer;
