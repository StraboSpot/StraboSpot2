import React from 'react';

import MapboxGL from '@rnmapbox/maps';
import {useSelector} from 'react-redux';

import useMapSymbology from '../symbology/useMapSymbology';

const FeaturesSelectedLayers = ({featuresSelected, isStratStyleLoaded}) => {
  const {stratSection} = useSelector(state => state.map);

  const {getLinesFilteredByPattern, getMapSymbology} = useMapSymbology();

  return (
    <MapboxGL.ShapeSource
      id={'spotsSelectedSource'}
      shape={featuresSelected}
    >
      {/* Polygon Selected */}
      <MapboxGL.FillLayer
        id={'polygonLayerSelected'}
        minZoomLevel={1}
        filter={['all', ['==', ['geometry-type'], 'Polygon'], ['!', ['has', 'fillPattern', ['get', 'symbology']]]]}
        style={getMapSymbology().polygonSelected}
      />
      <MapboxGL.FillLayer
        id={'polygonLayerWithPatternSelected'}
        minZoomLevel={1}
        filter={['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]]}
        style={{
          ...getMapSymbology().polygonWithPatternSelected,
          visibility: stratSection && isStratStyleLoaded ? 'visible' : 'none',
        }}
      />
      <MapboxGL.LineLayer
        id={'polygonLayerSelectedBorder'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'Polygon']}
        style={getMapSymbology().line}
      />
      <MapboxGL.SymbolLayer
        id={'polygonLabelLayerSelected'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'Polygon']}
        style={getMapSymbology().polygonLabel}
      />

      {/* Line Selected */}
      {/* Need 4 different lines for the different types of line dashes since
       lineDasharray is not supported with data-driven styling*/}
      <MapboxGL.LineLayer
        id={'lineLayerSelected'}
        minZoomLevel={1}
        filter={getLinesFilteredByPattern('solid')}
        style={getMapSymbology().lineSelected}
      />
      <MapboxGL.LineLayer
        id={'lineLayerSelectedDotted'}
        minZoomLevel={1}
        filter={getLinesFilteredByPattern('dotted')}
        style={getMapSymbology().lineSelectedDotted}
      />
      <MapboxGL.LineLayer
        id={'lineLayerSelectedDashed'}
        minZoomLevel={1}
        filter={getLinesFilteredByPattern('dashed')}
        style={getMapSymbology().lineSelectedDashed}
      />
      <MapboxGL.LineLayer
        id={'lineLayerSelectedDotDashed'}
        minZoomLevel={1}
        filter={getLinesFilteredByPattern('dotDashed')}
        style={getMapSymbology().lineSelectedDotDashed}
      />
      <MapboxGL.SymbolLayer
        id={'lineLabelLayerSelected'}
        minZoomLevel={1}
        filter={['==', ['geometry-type'], 'LineString']}
        style={getMapSymbology().lineLabel}
      />

    </MapboxGL.ShapeSource>
  );
};

export default FeaturesSelectedLayers;
