import {notebookReducers, SpotPages} from './Notebook.constants';

const initialState = {
  visiblePage: SpotPages.OVERVIEW,
  notebookPanelMenuVisible: false
};

export const notebookReducer = (state = initialState, action) => {
  switch (action.type) {
    case notebookReducers.SET_SPOT_PAGE_VISIBLE:
      return {
        ...state,
        visiblePage: action.page
      }
  }
  return state;
};
