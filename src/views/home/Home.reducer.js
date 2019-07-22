import {homeReducers} from "./Home.constants";
import {Dimensions, Platform} from 'react-native';

const initialState = {
  modalVisible: null,
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
      }
  }
  return state;
};
