import {SET_FORM_DATA} from "../Constants";

export const setFormData = (formData) => {
  return {
    type: SET_FORM_DATA,
    formData: formData
  }
};
