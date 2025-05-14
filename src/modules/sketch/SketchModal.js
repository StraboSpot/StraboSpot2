import React from 'react';

import {Overlay} from 'react-native-elements';

import Sketch from './Sketch';

const SketchModal = ({image, saveImages, setIsSketchModalVisible}) => {
  return (
    <Overlay
      supportedOrientations={['portrait', 'landscape']}
      fullScreen
    >
      <Sketch image={image} saveImages={saveImages} setIsSketchModalVisible={setIsSketchModalVisible}/>
    </Overlay>
  );
};

export default SketchModal;
