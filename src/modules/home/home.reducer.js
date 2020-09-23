import {Dimensions} from 'react-native';

import {redux} from '../../shared/app.constants';
import {homeReducers} from './home.constants';

const initialState = {
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
  isSettingsPanelVisible: false,
  deviceDimensions: Dimensions.get('window'),
  shortcutSwitchPosition: {
    Tag: false,
    Measurement: false,
    Sample: false,
    Note: false,
    Photo: false,
    Sketch: false,
  },
  projectLoadComplete: false,
};

export const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case homeReducers.SET_IS_SIGNED_IN:
      return {
        ...state,
        isSignedIn: action.bool,
      };
    case homeReducers.SET_MODAL_VISIBLE:
      return {
        ...state,
        modalVisible: action.modal,
      };
    case homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE:
      return {
        ...state,
        isStatusMessagesModalVisible: action.bool,
      };
    case homeReducers.SET_ERROR_MESSAGES_MODAL_VISIBLE:
      return {
        ...state,
        isErrorMessagesModalVisible: action.bool,
      };
    case homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE:
      return {
        ...state,
        isInfoModalVisible: action.bool,
      };
    case homeReducers.SET_PROJECT_LOAD_SELECTION_MODAL_VISIBLE:
      return {
        ...state,
        isProjectLoadSelectionModalVisible: action.bool,
      };
    case homeReducers.PROJECT_LOAD_COMPLETE: {
      return {
        ...state,
        projectLoadComplete: action.projectLoadComplete,
      };
    }
    case homeReducers.SET_OFFLINE_MAPS_MODAL_VISIBLE: {
      return {
        ...state,
        isOfflineMapModalVisible: action.bool,
      };
    }
    case homeReducers.DEVICE_DIMENSIONS:
      // console.log('REDUX DEVICE DIMS', state.deviceDimensions);
      // console.log('REDUX DIMS ACTION', action)
      return {
        ...state,
        deviceDimensions: action.dims,
      };
    case homeReducers.SHORTCUT_SWITCH_POSITION:
      return {
        ...state,
        shortcutSwitchPosition: {
          ...state.shortcutSwitchPosition,
          [action.switchName]: !state.shortcutSwitchPosition[action.switchName],
        },
      };
    case homeReducers.SET_ALLSPOTS_PANEL_VISIBLE:
      return {
        ...state,
        isAllSpotsPanelVisible: action.value,
      };
    case homeReducers.SET_SETTINGS_PANEL_VISIBLE:
      return {
        ...state,
        isSettingsPanelVisible: action.value,
      };
    case homeReducers.TOGGLE_IMAGE_MODAL:
      return {
        ...state,
        isImageModalVisible: action.value,
      };
    case homeReducers.SET_ISONLINE:
      return {
        ...state,
        isOnline: action.online,
      };
    case homeReducers.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.view]: action.bool,
        },
      };
    case homeReducers.ADD_STATUS_MESSAGE:
      return {
        ...state,
        statusMessages: [...state.statusMessages, action.statusMessage],
      };
    case homeReducers.REMOVE_LAST_STATUS_MESSAGE:
      return {
        ...state,
        statusMessages: state.statusMessages.slice(0, -1),
      };
    case homeReducers.CLEAR_STATUS_MESSAGES:
      return {
        ...state,
        statusMessages: [],
      };
    case redux.CLEAR_STORE:
      return initialState;
  }
  return state;
};
