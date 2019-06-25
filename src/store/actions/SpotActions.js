import {spotReducers} from "../../spots/Spot.constants";

export const editSpotProperties = (field, value) => {
  console.log(field, value)
  return {
    type: spotReducers.EDIT_SPOT_PROPERTIES,
    field: field,
    value: value
  }
};

