import {settingPanelReducers, SortedViews} from './settingsPanel.constants';

const initialState = {
  sortedView: SortedViews.CHRONOLOGICAL,
  selectedButtonIndex: 0,
  settingsPageVisible: null,
  sortedList: null
};

export const settingsPanelReducer = (state = initialState, action) => {
  switch (action.type) {
    case settingPanelReducers.SET_SORTED_VIEW:
      return {
        ...state,
        sortedView: action.view
      };
    case settingPanelReducers.SET_SORTED_LIST:
      return {
        ...state,
        sortedList: action.sortedList
      };
    case settingPanelReducers.SET_SELECTED_BUTTON_INDEX:
      return {
        ...state,
        selectedButtonIndex: action.index
      };
    case settingPanelReducers.SET_MENU_SELECTION_PAGE:
      return {
        ...state,
        settingsPageVisible: action.name
      }
  }
  return state
};



