import {homeReducers} from "./Home.constants";

const initialState = {
  modalVisible: null
};

export const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case homeReducers.SET_MODAL_VISIBLE:
      return {
        ...state,
        modalVisible: action.modal
      };
  }
  return state;
};
