import * as actionTypes from "../Constants";

export const editSpotProperties = (field, value) => {
  console.log(field, value)
  return {
    type: actionTypes.EDIT_SPOT_PROPERTIES,
    field: field,
    value: value
  }
};

export const notebookTimestamp = (timestamp) => {
  return {
    type: actionTypes.NOTEBOOK_TIMESTAMP,
    timestamp: timestamp
  }
};
