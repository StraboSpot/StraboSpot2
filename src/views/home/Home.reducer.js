import {homeReducers} from "./Home.constants";
import {Dimensions, Platform} from 'react-native';

const initialState = {
  modalVisible: null,
  isImageModalVisible: false,
  isAllSpotsPanelVisible: false,
  isSettingsPanelVisible: false,
  deviceDimensions: Dimensions.get(Platform.OS === 'ios' ? 'window' : 'screen'),
  shortcutSwitchPosition: {
    Tag: false,
    Measurement: false,
    Sample: false,
    Note: false,
    Photo: false,
    Sketch: false
  }
};

export const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case homeReducers.SET_MODAL_VISIBLE:
      return {
        ...state,
        modalVisible: action.modal
      };
    case homeReducers.DEVICE_DIMENSIONS:
      // console.log('REDUX DEVICE DIMS', state.deviceDimensions);
      // console.log('REDUX DIMS ACTION', action)
      return {
        ...state,
        deviceDimensions: action.dims
      }
    case homeReducers.SHORTCUT_SWITCH_POSITION:
      return {
        ...state,
        shortcutSwitchPosition: {
          ...state.shortcutSwitchPosition,
          [action.switchName]: !state.shortcutSwitchPosition[action.switchName]
        }
      };
    case homeReducers.SET_ALLSPOTS_PANEL_VISIBLE:
      return {
        ...state,
        isAllSpotsPanelVisible: action.value
      };
    case homeReducers.SET_SETTINGS_PANEL_VISIBLE:
      return {
        ...state,
        isSettingsPanelVisible: action.value
      };
    case homeReducers.TOGGLE_IMAGE_MODAL:
      return {
        ...state,
        isImageModalVisible: action.value,
      }
  }
  return state;
};
