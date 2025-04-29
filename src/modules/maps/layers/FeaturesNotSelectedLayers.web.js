import React from 'react';

import * as turf from '@turf/turf';
import {Layer, Source} from 'react-map-gl';

import useMapSymbology from '../symbology/useMapSymbology';

const FeaturesNotSelectedLayers = ({features}) => {

  const {getLayoutSymbology, getLinesFilteredByPattern, getPaintSymbology} = useMapSymbology();

  return (
    <Source
      id={'spotsNotSelectedSource'}
      type={'geojson'}
      data={turf.featureCollection(features)}
    >
      {/* Polygon Not Selected */}
      <Layer
        type={'fill'}
        id={'polygonLayerNotSelected'}
        filter={['all', ['==', ['geometry-type'], 'Polygon'], ['!', ['has', 'fillPattern', ['get', 'symbology']]]]}
        paint={getPaintSymbology().polygon}
      />
      <Layer
        type={'fill'}
        id={'polygonLayerWithPatternNotSelected'}
        filter={['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]]}
        paint={getPaintSymbology().polygonWithPattern}
      />
      <Layer
        type={'line'}
        id={'polygonLayerNotSelectedBorder'}
        filter={['==', ['geometry-type'], 'Polygon']}
        paint={getPaintSymbology().line}
      />
      <Layer
        type={'symbol'}
        id={'polygonLabelLayerNotSelected'}
        filter={['==', ['geometry-type'], 'Polygon']}
        layout={getLayoutSymbology().polygonLabel}
      />

      {/* Line Not Selected */}
      {/* Need 4 different lines for the different types of line dashes since
       lineDasharray is not supported with data-driven styling*/}
      <Layer
        type={'line'}
        id={'lineLayerNotSelected'}
        filter={getLinesFilteredByPattern('solid')}
        paint={getPaintSymbology().line}
      />
      <Layer
        type={'line'}
        id={'lineLayerNotSelectedDotted'}
        filter={getLinesFilteredByPattern('dotted')}
        paint={getPaintSymbology().lineDotted}
      />
      <Layer
        type={'line'}
        id={'lineLayerNotSelectedDashed'}
        filter={getLinesFilteredByPattern('dashed')}
        paint={getPaintSymbology().lineDashed}
      />
      <Layer
        type={'line'}
        id={'lineLayerNotSelectedDotDashed'}
        filter={getLinesFilteredByPattern('dotDashed')}
        paint={getPaintSymbology().lineDotDashed}
      />
      <Layer
        type={'symbol'}
        id={'lineLabelLayerNotSelected'}
        filter={['==', ['geometry-type'], 'LineString']}
        layout={getLayoutSymbology().lineLabel}
      />

      {/* Point Not Selected */}
      <Layer
        type={'symbol'}
        id={'pointLayerNotSelected'}
        filter={['==', ['geometry-type'], 'Point']}
        layout={getLayoutSymbology().point}
        paint={getPaintSymbology().point}
      />
    </Source>
  );
};

export default FeaturesNotSelectedLayers;
