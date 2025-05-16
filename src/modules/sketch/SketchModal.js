import React from 'react';

import {Overlay} from '@rn-vui/base';

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
