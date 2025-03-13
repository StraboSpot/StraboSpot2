import React from 'react';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';

import useMapSymbology from '../symbology/useMapSymbology';

const DrawLayers = ({drawFeatures}) => {

  const {getMapSymbology} = useMapSymbology();

  return (
    <MapboxGL.ShapeSource
      id={'drawFeatures'}
      shape={turf.featureCollection(drawFeatures)}
    >
      <MapboxGL.CircleLayer
        id={'pointLayerDraw'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'Point']}
        style={getMapSymbology().pointDraw}
      />
      <MapboxGL.LineLayer
        id={'lineLayerDraw'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'LineString']}
        style={getMapSymbology().lineDraw}
      />
      <MapboxGL.FillLayer
        id={'polygonLayerDraw'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'Polygon']}
        style={getMapSymbology().polygonDraw}
      />
    </MapboxGL.ShapeSource>
  );
};

export default DrawLayers;
