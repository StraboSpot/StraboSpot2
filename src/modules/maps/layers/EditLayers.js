import React from 'react';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';

import useMapSymbology from '../symbology/useMapSymbology';

const EditLayers = ({editFeatureVertex}) => {

  const {getMapSymbology} = useMapSymbology();

  return (
    <MapboxGL.ShapeSource
      id={'editFeatureVertex'}
      shape={turf.featureCollection(editFeatureVertex)}
    >
      <MapboxGL.CircleLayer
        id={'pointLayerEdit'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'Point']}
        style={getMapSymbology().pointEdit}
      />
    </MapboxGL.ShapeSource>
  );
};

export default EditLayers;
