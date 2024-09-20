import React from 'react';

import MapboxGL from '@rnmapbox/maps';

import useYAxisHook from './useYAxis';
import useMapSymbology from '../symbology/useMapSymbology';

const YAxis = ({spotsDisplayed}) => {
  const {getMapSymbology} = useMapSymbology();
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
          style={getMapSymbology().yAxisTickMarkLabels}
        />
      </MapboxGL.ShapeSource>
    </>
  );
};

export default YAxis;
