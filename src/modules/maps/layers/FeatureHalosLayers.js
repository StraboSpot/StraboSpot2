import React from 'react';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';

import useMapSymbology from '../symbology/useMapSymbology';

const FeatureHalosLayers = ({featuresNotSelected, featuresSelected}) => {
  const {getMapSymbology} = useMapSymbology();

  // Get only 1 selected and not selected feature per id for colored halos so multiple halos aren't stacked
  const featuresNotSelectedUniq = featuresNotSelected.reduce((acc, f) =>
    acc.map(f1 => f1.properties.id).includes(f.properties.id) ? acc : [...acc, f], []);
  const featuresSelectedUniq = featuresSelected.reduce((acc, f) =>
    acc.map(f1 => f1.properties.id).includes(f.properties.id) ? acc : [...acc, f], []);

  return (
    <>
      {/* Halo Around Selected Point Feature Layer */}
      <MapboxGL.ShapeSource
        id={'pointSpotsSelectedSource'}
        shape={turf.featureCollection(featuresSelectedUniq)}
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
        shape={turf.featureCollection(featuresNotSelectedUniq)}
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
