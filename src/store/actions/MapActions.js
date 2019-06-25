import {FEATURE_ADD, FEATURE_DELETE, SET_SPOT_PAGE_VISIBLE} from "../Constants";
import {notebookReducers} from "../../components/notebook-panel/Notebook.constants";
import {spotReducers} from "../../spots/Spot.constants";

export const addFeature = (field, value) => {
  return {
    type: spotReducers.FEATURE_ADD,
    field: field,
    value: value
  }
};

export const deleteFeature = (id) => {
  return {
    type: spotReducers.FEATURE_DELETE,
    id: id
  }
};

export const setSpotPageVisible = (page) => {
  return {
    type: notebookReducers.SET_SPOT_PAGE_VISIBLE,
    page: page
  }
};
