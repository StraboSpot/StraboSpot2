import React from 'react';

import {Overlay} from 'react-native-elements';

import {ImageInfo} from '.';

const ImageModal = ({deleteImage, image, saveImages, saveUpdatedImage, setImageToView, setIsImageModalVisible}) => {
  return (
    <Overlay fullScreen>
      <ImageInfo
        deleteImage={deleteImage}
        image={image}
        saveImages={saveImages}
        saveUpdatedImage={saveUpdatedImage}
        setImageToView={setImageToView}
        setIsImageModalVisible={setIsImageModalVisible}
      />
    </Overlay>
  );
};

export default ImageModal;
