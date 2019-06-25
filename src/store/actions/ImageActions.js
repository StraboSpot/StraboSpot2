import {spotReducers} from "../../spots/Spot.constants";
import {imageReducers} from "../../components/images/Image.constants";

export const addPhoto = (image) => {
  return {
    type: imageReducers.ADD_PHOTOS,
    images: image
  }
};

export const editSpotImage = (image) => {
  return {
    type: spotReducers.EDIT_SPOT_IMAGES,
    images: image
  }
};
