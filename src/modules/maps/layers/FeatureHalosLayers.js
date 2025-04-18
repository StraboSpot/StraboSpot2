import React from 'react';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';

import useMapSymbology from '../symbology/useMapSymbology';

const FeatureHalosLayers = ({spotsNotSelected, spotsSelected}) => {
  const {getMapSymbology} = useMapSymbology();

  return (
    <>
      {/* Halo Around Selected Point Feature Layer */}
      <MapboxGL.ShapeSource
        id={'pointSpotsSelectedSource'}
        shape={turf.featureCollection(spotsSelected)}
      >
        <MapboxGL.CircleLayer
          id={'pointLayerSelectedHalo'}
          minZoomLevel={1}
          filter={['==', ['geometry-type'], 'Point']}
          style={getMapSymbology().pointSelected}
        />
      </MapboxGL.ShapeSource>

      {/* Colored Halo Around Points Layer */}
      <MapboxGL.ShapeSource
        id={'pointSourceColorHalo'}
        shape={turf.featureCollection(spotsNotSelected)}
      >
        <MapboxGL.CircleLayer
          id={'pointLayerColorHalo'}
          minZoomLevel={1}
          filter={['==', ['geometry-type'], 'Point']}
          style={getMapSymbology().pointColorHalo}
        />
      </MapboxGL.ShapeSource>
    </>
  );
};

export default FeatureHalosLayers;
