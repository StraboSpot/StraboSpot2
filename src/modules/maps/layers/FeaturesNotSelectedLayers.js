import React from 'react';

import MapboxGL from '@rnmapbox/maps';
import {useSelector} from 'react-redux';

import useMapSymbology from '../symbology/useMapSymbology';

const FeaturesNotSelectedLayers = ({featuresNotSelected, isStratStyleLoaded}) => {
  const {stratSection} = useSelector(state => state.map);

  const {getLinesFilteredByPattern, getMapSymbology} = useMapSymbology();

  return (
    <MapboxGL.ShapeSource
      id={'spotsNotSelectedSource'}
      shape={featuresNotSelected}
    >
      {/* Polygon Not Selected */}
      <MapboxGL.FillLayer
        id={'polygonLayerNotSelected'}
        minZoomLevel={1}
        filter={['all', ['==', ['geometry-type'], 'Polygon'], ['!', ['has', 'fillPattern', ['get', 'symbology']]]]}
        style={getMapSymbology().polygon}
      />
      <MapboxGL.FillLayer
        id={'polygonLayerWithPatternNotSelected'}
        minZoomLevel={1}
        filter={['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]]}
        style={{
          ...getMapSymbology().polygonWithPattern,
          visibility: stratSection && isStratStyleLoaded ? 'visible' : 'none',
        }}
      />
      <MapboxGL.LineLayer
        id={'polygonLayerNotSelectedBorder'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'Polygon']}
        style={getMapSymbology().line}
      />
      <MapboxGL.SymbolLayer
        id={'polygonLabelLayerNotSelected'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'Polygon']}
        style={getMapSymbology().polygonLabel}
      />

      {/* Line Not Selected */}
      {/* Need 4 different lines for the different types of line dashes since
       lineDasharray is not supported with data-driven styling*/}
      <MapboxGL.LineLayer
        id={'lineLayerNotSelected'}
        minZoomLevel={1}
        filter={getLinesFilteredByPattern('solid')}
        style={getMapSymbology().line}
      />
      <MapboxGL.LineLayer
        id={'lineLayerNotSelectedDotted'}
        minZoomLevel={1}
        filter={getLinesFilteredByPattern('dotted')}
        style={getMapSymbology().lineDotted}
      />
      <MapboxGL.LineLayer
        id={'lineLayerNotSelectedDashed'}
        minZoomLevel={1}
        filter={getLinesFilteredByPattern('dashed')}
        style={getMapSymbology().lineDashed}
      />
      <MapboxGL.LineLayer
        id={'lineLayerNotSelectedDotDashed'}
        minZoomLevel={1}
        filter={getLinesFilteredByPattern('dotDashed')}
        style={getMapSymbology().lineDotDashed}
      />
      <MapboxGL.SymbolLayer
        id={'lineLabelLayerNotSelected'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'LineString']}
        style={getMapSymbology().lineLabel}
      />

      {/* Point Not Selected */}
      <MapboxGL.SymbolLayer
        id={'pointLayerNotSelected'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'Point']}
        style={getMapSymbology().point}
      />
    </MapboxGL.ShapeSource>
  );
};

export default FeaturesNotSelectedLayers;
