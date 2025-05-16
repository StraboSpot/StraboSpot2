import React from 'react';

import {Overlay} from '@rn-vui/base';

import {ImageInfo} from '.';

const ImageModal = ({deleteImage, image, saveImages, saveUpdatedImage, setImageToView, setIsImageModalVisible}) => {
  return (
    <Overlay
      supportedOrientations={['portrait', 'landscape']}
      fullScreen
    >
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
