import React from 'react';
import {Text} from 'react-native';

import RNScalebar from 'react-native-map-scale-bar';

import homeStyles from '../../modules/home/home.style';

const ScaleBarAndZoom = (props) => {

  return (
    <>
      <RNScalebar
        zoom={props.zoom}
        latitude={props.latitude}
        left={100}
        bottom={0}
      />
      <Text style={props.basemap.id === 'mapbox.satellite' ? homeStyles.currentZoomTextWhite
        : homeStyles.currentZoomTextBlack}>
        Zoom:
      </Text>
      <Text style={props.basemap.id === 'mapbox.satellite' ? homeStyles.currentZoomTextWhite
        : homeStyles.currentZoomTextBlack}>
        {props.currentZoom}
      </Text>
    </>
  );
};

export default ScaleBarAndZoom;
