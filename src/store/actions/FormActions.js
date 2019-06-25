import {formReducers} from "../../components/form/Form.constant";

export const setFormData = (formData) => {
  return {
    type: formReducers.SET_FORM_DATA,
    formData: formData
  }
};
