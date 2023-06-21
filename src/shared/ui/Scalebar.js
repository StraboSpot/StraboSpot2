import React from 'react';
import {Text} from 'react-native';

import RNScalebar from 'react-native-map-scale-bar';

import homeStyles from '../../modules/home/home.style';

const ScaleBarAndZoom = (props) => {
  const textStyle = props.basemap.id === 'mapbox.satellite' ? homeStyles.currentZoomTextWhite
    : homeStyles.currentZoomTextBlack;

  return (
    <>
      <RNScalebar
        zoom={props.zoom}
        latitude={props.latitude}
        left={100}
        bottom={0}
      />
      <Text style={textStyle}>Zoom:</Text>
      <Text style={textStyle}>{props.zoom.toFixed(1)}</Text>
    </>
  );
};

export default ScaleBarAndZoom;
