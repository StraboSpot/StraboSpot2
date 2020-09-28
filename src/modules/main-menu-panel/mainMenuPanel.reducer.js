import {mainMenuPanelReducers, SortedViews} from './mainMenuPanel.constants';

const initialState = {
  sortedView: SortedViews.CHRONOLOGICAL,
  selectedButtonIndex: 0,
  mainMenuPageVisible: undefined,
  isSidePanelVisible: false,
  sidePanelView: null,
};

export const mainMenuPanelReducer = (state = initialState, action) => {
  switch (action.type) {
    case mainMenuPanelReducers.SET_SORTED_VIEW:
      return {
        ...state,
        sortedView: action.view,
      };
    case mainMenuPanelReducers.SET_SELECTED_BUTTON_INDEX:
      return {
        ...state,
        selectedButtonIndex: action.index,
      };
    case mainMenuPanelReducers.SET_MENU_SELECTION_PAGE:
      return {
        ...state,
        mainMenuPageVisible: action.name,
      };
    case mainMenuPanelReducers.SET_SIDE_PANEL_VISIBLE:
      return {
        ...state,
        isSidePanelVisible: action.bool,
        sidePanelView: action.view,
        tag: action.tag,
      };
  }
  return state;
};



