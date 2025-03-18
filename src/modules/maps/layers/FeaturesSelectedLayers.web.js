import React from 'react';

import {Layer, Source} from 'react-map-gl';

import useMapSymbology from '../symbology/useMapSymbology';

const FeaturesSelectedLayers = ({featuresSelected}) => {

  const {getLayoutSymbology, getLinesFilteredByPattern, getPaintSymbology} = useMapSymbology();

  return (
    <Source
      id={'spotsSelectedSource'}
      type={'geojson'}
      data={featuresSelected}
    >
      {/* Polygon Selected */}
      <Layer
        type={'fill'}
        id={'polygonLayerSelected'}
        filter={['all', ['==', ['geometry-type'], 'Polygon'], ['!', ['has', 'fillPattern', ['get', 'symbology']]]]}
        paint={getPaintSymbology().polygonSelected}
      />
      <Layer
        type={'fill'}
        id={'polygonLayerWithPatternSelected'}
        filter={['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]]}
        paint={getPaintSymbology().polygonWithPatternSelected}
      />
      <Layer
        type={'line'}
        id={'polygonLayerSelectedBorder'}
        filter={['==', ['geometry-type'], 'Polygon']}
        paint={getPaintSymbology().line}
      />
      <Layer
        type={'symbol'}
        id={'polygonLabelLayerSelected'}
        filter={['==', ['geometry-type'], 'Polygon']}
        layout={getLayoutSymbology().polygonLabel}
      />

      {/* Line Selected */}
      {/* Need 4 different lines for the different types of line dashes since
       lineDasharray is not supported with data-driven styling*/}
      <Layer
        type={'line'}
        id={'lineLayerSelected'}
        filter={getLinesFilteredByPattern('solid')}
        paint={getPaintSymbology().lineSelected}
      />
      <Layer
        type={'line'}
        id={'lineLayerSelectedDotted'}
        filter={getLinesFilteredByPattern('dotted')}
        paint={getPaintSymbology().lineSelectedDotted}
      />
      <Layer
        type={'line'}
        id={'lineLayerSelectedDashed'}
        filter={getLinesFilteredByPattern('dashed')}
        paint={getPaintSymbology().lineSelectedDashed}
      />
      <Layer
        type={'line'}
        id={'lineLayerSelectedDotDashed'}
        filter={getLinesFilteredByPattern('dotDashed')}
        paint={getPaintSymbology().lineSelectedDotDashed}
      />
      <Layer
        type={'symbol'}
        id={'lineLabelLayerSelected'}
        filter={['==', ['geometry-type'], 'LineString']}
        layout={getLayoutSymbology().lineLabel}
      />
    </Source>
  );
};

export default FeaturesSelectedLayers;
