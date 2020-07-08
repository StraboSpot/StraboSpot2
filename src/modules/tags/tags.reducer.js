import {tagsReducers} from './tags.constants';

const initialState = {
  selectedTag: null,
};

export const tagsReducer = (state = initialState, action) => {
  switch (action.type) {
    case tagsReducers.SELECTED_TAG:
      return {
        ...state,
        selectedTag: action.tag,
      };
    case tagsReducers.UPDATE_TAG:
      return {
        ...state,
        selectedTag: action.value
      };
  }
  return state;
};
