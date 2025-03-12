import React from 'react';

import * as turf from '@turf/turf';
import {Layer, Source} from 'react-map-gl';

import useMapSymbology from '../symbology/useMapSymbology';

const EditLayers = ({editFeatureVertex}) => {

  const {getPaintSymbology} = useMapSymbology();

  return (
    <Source
      id={'editFeatureVertex'}
      type={'geojson'}
      data={turf.featureCollection(editFeatureVertex)}
    >
      <Layer
        type={'circle'}
        id={'pointLayerEdit'}
        filter={['==', ['geometry-type'], 'Point']}
        paint={getPaintSymbology().pointEdit}
      />
    </Source>
  );
};

export default EditLayers;
