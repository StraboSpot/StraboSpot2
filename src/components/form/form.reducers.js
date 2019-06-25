import {formReducers} from "./Form.constant";
import {SET_FORM_DATA} from "../../store/Constants";

const initialFormState = {
  formData: {}
};

export const formReducer = (state = initialFormState, action) => {
  switch (action.type) {
    case formReducers.SET_FORM_DATA:
      console.log('SET_FORM_DATA', action);
      return {
        ...state,
        formData: action.formData
      }
  }
  return state;
};
