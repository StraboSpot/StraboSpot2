import React from 'react';

import MapboxGL from '@rnmapbox/maps';

import useXAxisHook from './useXAxis';
import useMapSymbologyHook from '../symbology/useMapSymbology';

const XAxis = ({n = 1}) => {
  const useMapSymbology = useMapSymbologyHook();
  const useXAxis = useXAxisHook(n);

  return (
    <>
      {/* X Axis Line*/}
      <MapboxGL.ShapeSource
        id={'xAxisSource' + n}
        shape={useXAxis.getXAxis()}
      >
        <MapboxGL.LineLayer
          id={'xAxisLayer' + n}
          minZoomLevel={1}
        />
      </MapboxGL.ShapeSource>

      {/* X Axis Tick Marks */}
      <MapboxGL.ShapeSource
        id={'xAxisTickMarksSource' + n}
        shape={useXAxis.getXAxisTickMarks()}
      >
        <MapboxGL.LineLayer
          id={'xAxisTickMarksLayer' + n}
          minZoomLevel={1}
        />
        <MapboxGL.SymbolLayer
          id={'xAxisTickMarksLabelLayer' + n}
          minZoomLevel={1}
          style={useMapSymbology.getMapSymbology().xAxisTickMarkLabels}
        />
      </MapboxGL.ShapeSource>
    </>
  );
};

export default XAxis;
