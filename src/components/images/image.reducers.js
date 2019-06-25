import {imageReducers} from "./Image.constants";

const initialImageState = {
  imagePaths: {}
};

export const imageReducer = (state = initialImageState, action) => {
  switch (action.type) {
    case imageReducers.ADD_PHOTOS:
      console.log('ADD_PHOTOS', action);
      let updatedImages = null;
      let imagePathsTemp = {};
      // console.log(action.images);
      action.images.map(data => {
        imagePathsTemp[data.id] = data.src;
        // console.log('photo in reducer\n', 'ID:', data.id, '\nSRC:', data.src, '\nNAME:', data.name);
        // const {id, src} = data;

        // updatedImages = state.imagePaths.concat(imagePathsTemp)
      });
      console.log(state.imagePaths, '\n', imagePathsTemp);
      return {
        ...state,
        imagePaths: {...state.imagePaths, ...imagePathsTemp}
      }
  }
  return state;
};
