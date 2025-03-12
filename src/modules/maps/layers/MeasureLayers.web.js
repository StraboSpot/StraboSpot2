import React from 'react';

import * as turf from '@turf/turf';
import {Layer, Source} from 'react-map-gl';

import useMapSymbology from '../symbology/useMapSymbology';

const MeasureLayers = ({measureFeatures}) => {

  const {getPaintSymbology} = useMapSymbology();

  return (
    <Source
      id={'mapMeasure'}
      type={'geojson'}
      data={turf.featureCollection(measureFeatures)}
    >
      <Layer
        type={'circle'}
        id={'measureLayerPoints'}
        filter={['==', ['geometry-type'], 'Point']}
        paint={getPaintSymbology().pointMeasure}
      />
      <Layer
        type={'line'}
        id={'measureLayerLines'}
        filter={['==', ['geometry-type'], 'LineString']}
        paint={getPaintSymbology().lineMeasure}
      />
    </Source>
  );
};

export default MeasureLayers;
