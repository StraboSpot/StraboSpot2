import React from 'react';

import useImagesHook from '../images/useImages';

const useImportImages = () => {

  const [useImages] = useImagesHook();

  const resizeImages = () => {
    console.log('IN RESIZE IMAGES FOR WEB');
  };

  const uploadImages = async (imageOjb) => {
    console.log('IMAGE OBJ', imageOjb);
    const resizedImage = await resizeImageIfNecessaryWeb(imageOjb);
    console.log('Resized Image', resizedImage);

    const formData = new FormData();

    // formData.append('image_file', {}, );
  };


  const resizeImageIfNecessaryWeb = async (image) => {


    console.log(image.fileObj);
  };

  return {
    resizeImages: resizeImages,
    uploadImages: uploadImages,
  };
};


export default useImportImages;

