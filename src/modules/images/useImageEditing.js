import ImageResizer from '@bam.tech/react-native-image-resizer';

import {APP_DIRECTORIES} from '../../services/directories.constants';
import useDevice from '../../services/useDevice';

const useImageEditing = (props) => {
  const tempImagesDownsizedDirectory = APP_DIRECTORIES.APP_DIR + '/TempImages';

  const resizeImage = async (imageProps) => {
    console.log(imageProps);
    const {imageUri, height, width, type, quality, rotation, name} = imageProps;
    let imageHeight = height;
    let imageWidth = width;

    if (width && height) {
      let max_size = 4032;
      if (name === 'profile') max_size = 300;
      else if (name === 'thumbnail') max_size = 200;
      else if (name === 'upload') max_size = 2000;
      if (width > height && width > max_size) {
        imageHeight = max_size * height / width;
        imageWidth = max_size;
      }
      else if (height > max_size) {
        imageWidth = max_size * width / height;
        imageHeight = max_size;
      }
      await useDevice.makeDirectory(tempImagesDownsizedDirectory);

      // : [imageUri, width, height, type, quality, rotation];
      const resizedImage = await ImageResizer.createResizedImage(
        imageUri,
        imageWidth,
        imageHeight,
        type,
        quality,
        rotation,
        undefined,
        false,
        {
          mode: 'contain',
          onlyScaleDown: false,
        },
      );

      // Just for information not needed
      let imageSizeText;
      if (resizedImage.size < 1024) imageSizeText = resizedImage.size + ' bytes';
      else if (resizedImage.size < 1048576) imageSizeText = (resizedImage.size / 1024).toFixed(3) + ' kB';
      else if (resizedImage.size < 1073741824) imageSizeText = (resizedImage.size / 1048576).toFixed(2) + ' MB';
      else imageSizeText = (resizedImage.size / 1073741824).toFixed(3) + ' GB';
      console.log(name + ': Finished Resizing Image', imageProps.id, 'New Size', imageSizeText);
      // =================

      return resizedImage;
    }
  };

  return {
    resizeImage: resizeImage,
  };
};

export default useImageEditing;
