import React from 'react';

import * as turf from '@turf/turf';
import {Layer, Source} from 'react-map-gl';

import useMapSymbology from '../symbology/useMapSymbology';

const FeatureHalosLayers = ({featuresNotSelected, featuresSelected}) => {
  const {getPaintSymbology} = useMapSymbology();

  // Get only 1 selected and not selected feature per id for colored halos so multiple halos aren't stacked
  const featuresNotSelectedUniq = turf.featureCollection(
    featuresNotSelected.features?.reduce((acc, f) =>
      acc.map(f1 => f1.properties.id).includes(f.properties.id) ? acc : [...acc, f], []));
  const featuresSelectedUniq = turf.featureCollection(
    featuresSelected.features?.reduce((acc, f) =>
      acc.map(f1 => f1.properties.id).includes(f.properties.id) ? acc : [...acc, f], []));

  return (
    <>
      {/* Halo Around Selected Point Feature Layer */}
      <Source
        id={'pointSpotsSelectedSource'}
        type={'geojson'}
        data={featuresSelectedUniq}
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
        data={featuresNotSelectedUniq}
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
