import {FEATURE_ADD, FEATURE_DELETE, SET_SPOT_PAGE_VISIBLE} from "../Constants";

export const addFeature = (field, value) => {
  return {
    type: FEATURE_ADD,
    field: field,
    value: value
  }
};

export const deleteFeature = (id) => {
  return {
    type: FEATURE_DELETE,
    id: id
  }
};

export const setSpotPageVisible = (page) => {
  return {
    type: SET_SPOT_PAGE_VISIBLE,
    page: page
  }
};
