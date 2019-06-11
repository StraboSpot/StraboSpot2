import * as actionTypes from "../Constants";

export const addPhoto = (image) => {
  return {
    type: actionTypes.ADD_PHOTOS,
    images: image
  }
};

export const editSpotImage = (image) => {
  return {
    type: actionTypes.EDIT_SPOT_IMAGES,
    images: image
  }
};
