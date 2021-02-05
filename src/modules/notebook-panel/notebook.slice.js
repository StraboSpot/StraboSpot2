import {createSlice} from '@reduxjs/toolkit';

import {isEmpty} from '../../shared/Helpers';
import {COMPASS_TOGGLE_BUTTONS} from '../compass/compass.constants';
import {PRIMARY_NOTEBOOK_PAGES} from './notebook.constants';

const initialNotebookState = {
  visibleNotebookPagesStack: [],
  isNotebookPanelVisible: false,
  isSamplesModalVisible: false,
  compassMeasurementTypes: [COMPASS_TOGGLE_BUTTONS.PLANAR],
  notebookToolbarIcons: Object.values(PRIMARY_NOTEBOOK_PAGES),
};

const notebookSlice = createSlice({
  name: 'notebook',
  initialState: initialNotebookState,
  reducers: {
    setCompassMeasurementTypes(state, action) {
      state.compassMeasurementTypes = action.payload;
    },
    setNotebookPageVisible(state, action) {
      let visibleNotebookPagesStack = state.visibleNotebookPagesStack;
      if (isEmpty(visibleNotebookPagesStack)) state.visibleNotebookPagesStack = [action.payload];
      else if (visibleNotebookPagesStack.length > 1
        && visibleNotebookPagesStack.slice(-2)[0] === action.payload) {
        state.visibleNotebookPagesStack = state.visibleNotebookPagesStack.slice(0, -1);
      }
      else if (visibleNotebookPagesStack.slice(-1)[0] !== action.payload) {
        visibleNotebookPagesStack = state.visibleNotebookPagesStack.push(action.payload);
      }
    },
    setNotebookPageVisibleToPrev(state, action) {
      state.visibleNotebookPagesStack = state.visibleNotebookPagesStack.slice(0, -1);
    },
    setNotebookPanelVisible(state, action) {
      state.isNotebookPanelVisible = action.payload;
    },
    addedNotebookToolbarIcon(state, action) {
      state.notebookToolbarIcons = [...state.notebookToolbarIcons, action.payload];
    },
    removedNotebookToolbarIcon(state, action) {
      state.notebookToolbarIcons = state.notebookToolbarIcons.filter(s => s !== action.payload);
    },
  },
});

export const {
  setCompassMeasurementTypes,
  setNotebookPageVisible,
  setNotebookPageVisibleToPrev,
  setNotebookPanelVisible,
  addedNotebookToolbarIcon,
  removedNotebookToolbarIcon,
} = notebookSlice.actions;

export default notebookSlice.reducer;
