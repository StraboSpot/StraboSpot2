import React from 'react';

import * as turf from '@turf/turf';
import {Layer, Source} from 'react-map-gl';

import useMapSymbology from '../symbology/useMapSymbology';

const FeatureHalosLayers = ({spotsNotSelected, spotsSelected}) => {
  const {getPaintSymbology} = useMapSymbology();

  return (
    <>
      {/* Halo Around Selected Point Feature Layer */}
      <Source
        id={'pointSpotsSelectedSource'}
        type={'geojson'}
        data={turf.featureCollection(spotsSelected)}
      >
        <Layer
          type={'circle'}
          id={'pointLayerSelectedHalo'}
          filter={['==', ['geometry-type'], 'Point']}
          paint={getPaintSymbology().pointSelected}
        />
      </Source>

      {/* Colored Halo Around Points Layer */}
      <Source
        id={'pointSourceColorHalo'}
        type={'geojson'}
        data={turf.featureCollection(spotsNotSelected)}
      >
        <Layer
          type={'circle'}
          id={'pointLayerColorHalo'}
          filter={['==', ['geometry-type'], 'Point']}
          paint={getPaintSymbology().pointColorHalo}
        />
      </Source>
    </>
  );
};

export default FeatureHalosLayers;
