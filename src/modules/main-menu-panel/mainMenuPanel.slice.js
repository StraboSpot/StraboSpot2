import {createSlice} from '@reduxjs/toolkit';

import {SORTED_VIEWS} from './mainMenu.constants';

const initialMainMenuState = {
  appVersion: null,
  sortedView: SORTED_VIEWS.CHRONOLOGICAL,
  selectedButtonIndex: 0,
  mainMenuPageVisible: null,
  isSidePanelVisible: false,
  sidePanelView: null,
};

// createSlice combines reducers, actions, and constants
const mainMenuSlice = createSlice({
  name: 'mainMenu',
  initialState: initialMainMenuState,
  reducers: {
    setAppVersion(state, action) {
      state.appVersion = action.payload;
    },
    setMenuSelectionPage(state, action) {
      state.mainMenuPageVisible = action.payload.name;
    },
    setSelectedButtonIndex(state, action) {
      state.selectedButtonIndex = action.payload.index;
    },
    setSidePanelVisible(state, action) {
      state.isSidePanelVisible = action.payload.bool;
      state.sidePanelView = action.payload.view;
      state.tag = action.payload.tag;
    },
    setSortedView(state, action) {
      state.sortedView = action.payload.view;
    },
  },
});

export const {
  setAppVersion,
  setMenuSelectionPage,
  setSelectedButtonIndex,
  setSidePanelVisible,
  setSortedView,
} = mainMenuSlice.actions;

export default mainMenuSlice.reducer;


