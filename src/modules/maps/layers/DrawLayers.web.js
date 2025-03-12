import React from 'react';

import * as turf from '@turf/turf';
import {Layer, Source} from 'react-map-gl';

import useMapSymbology from '../symbology/useMapSymbology';

const DrawLayers = ({drawFeatures}) => {

  const {getPaintSymbology} = useMapSymbology();

  return (
    <Source
      id={'drawFeatures'}
      type={'geojson'}
      data={turf.featureCollection(drawFeatures)}
    >
      <Layer
        type={'circle'}
        id={'pointLayerDraw'}
        filter={['==', ['geometry-type'], 'Point']}
        paint={getPaintSymbology().pointDraw}
      />
      <Layer
        type={'line'}
        id={'lineLayerDraw'}
        filter={['==', ['geometry-type'], 'LineString']}
        paint={getPaintSymbology().lineDraw}
      />
      <Layer
        type={'fill'}
        id={'polygonLayerDraw'}
        filter={['==', ['geometry-type'], 'Polygon']}
        paint={getPaintSymbology().polygonDraw}
      />
    </Source>
  );
};

export default DrawLayers;
