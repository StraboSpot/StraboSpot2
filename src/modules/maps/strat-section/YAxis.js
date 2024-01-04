import React from 'react';

import MapboxGL from '@rnmapbox/maps';

import useYAxisHook from './useYAxis';
import useMapSymbologyHook from '../symbology/useMapSymbology';

const YAxis = ({spotsDisplayed}) => {
  const useMapSymbology = useMapSymbologyHook();
  const useYAxis = useYAxisHook(spotsDisplayed);

  return (
    <>
      {/* Y Axis Line */}
      <MapboxGL.ShapeSource
        id={'yAxisSource'}
        shape={useYAxis.getYAxis()}
      >
        <MapboxGL.LineLayer
          id={'yAxisLayer'}
          minZoomLevel={1}
        />
      </MapboxGL.ShapeSource>

      {/* Y Axis Tick Marks */}
      <MapboxGL.ShapeSource
        id={'yAxisTickMarksSource'}
        shape={useYAxis.getYAxisTickMarks()}
      >
        <MapboxGL.LineLayer
          id={'yAxisTickMarksLayer'}
          minZoomLevel={1}
        />
        <MapboxGL.SymbolLayer
          id={'yAxisTickMarksLabelLayer'}
          minZoomLevel={1}
          style={useMapSymbology.getMapSymbology().yAxisTickMarkLabels}
        />
      </MapboxGL.ShapeSource>
    </>
  );
};

export default YAxis;
