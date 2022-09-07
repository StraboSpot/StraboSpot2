import React from 'react';
import {Text} from 'react-native';

import RNScalebar from 'react-native-map-scale-bar';
import {useSelector} from 'react-redux';

import homeStyles from '../../modules/home/home.style';

const ScaleBarAndZoom = (props) => {
  const center = useSelector(state => state.map.center);
  const zoom = useSelector(state => state.map.zoom);

  const textStyle = props.basemap.id === 'mapbox.satellite' ? homeStyles.currentZoomTextWhite
    : homeStyles.currentZoomTextBlack

  return (
    <>
      <RNScalebar
        zoom={zoom}
        latitude={center[1]}
        left={100}
        bottom={0}
      />
      <Text style={textStyle}>Zoom:</Text>
      <Text style={textStyle}>{zoom.toFixed(1)}</Text>
    </>
  );
};

export default ScaleBarAndZoom;
