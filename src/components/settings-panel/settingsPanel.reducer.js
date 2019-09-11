import {SET_SELECTED_BUTTON_INDEX, SET_SORTED_VIEW} from './settingsPanel.constants';

const initialState = {
  sortedView: null,
  selectedButtonIndex: 0
};

export const settingsPanelReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SORTED_VIEW:
      return {
        ...state,
        sortedView: action.view
      }
    case SET_SELECTED_BUTTON_INDEX:
      return {
        ...state,
        selectedButtonIndex: action.index
      }
  }
  return state
};



