import {createSlice} from '@reduxjs/toolkit';

import {isEmpty} from '../../shared/Helpers';

const initialNotebookState = {
  visibleNotebookPagesStack: [],
  isNotebookPanelVisible: false,
  isSamplesModalVisible: false,
  notebookPagesOn: ['geologic_unit', 'notes', 'orientation_data', 'images', 'tags', 'samples'],
  // notebookPagesOn: PRIMARY_PAGES.map(p => p.key),  // This worked in Native but not Web
};

const notebookSlice = createSlice({
  name: 'notebook',
  initialState: initialNotebookState,
  reducers: {
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
    setNotebookPageVisibleToPrev(state) {
      state.visibleNotebookPagesStack = state.visibleNotebookPagesStack.slice(0, -1);
    },
    setNotebookPanelVisible(state, action) {
      state.isNotebookPanelVisible = action.payload;
    },
    addedNotebookPageOn(state, action) {
      state.notebookPagesOn = [...state.notebookPagesOn, action.payload];
    },
    removedNotebookPageOn(state, action) {
      state.notebookPagesOn = state.notebookPagesOn.filter(s => s !== action.payload);
    },
  },
});

export const {
  setNotebookPageVisible,
  setNotebookPageVisibleToPrev,
  setNotebookPanelVisible,
  addedNotebookPageOn,
  removedNotebookPageOn,
} = notebookSlice.actions;

export default notebookSlice.reducer;
