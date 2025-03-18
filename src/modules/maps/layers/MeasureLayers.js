import React from 'react';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';

import useMapSymbology from '../symbology/useMapSymbology';

const MeasureLayers = ({measureFeatures}) => {

  const {getMapSymbology} = useMapSymbology();

  return (
    <MapboxGL.ShapeSource
      id={'mapMeasure'}
      shape={turf.featureCollection(measureFeatures)}
    >
      <MapboxGL.CircleLayer
        id={'measureLayerPoints'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'Point']}
        style={getMapSymbology().pointMeasure}
      />
      <MapboxGL.LineLayer
        id={'measureLayerLines'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'LineString']}
        style={getMapSymbology().lineMeasure}
      />
    </MapboxGL.ShapeSource>
  );
};

export default MeasureLayers;
