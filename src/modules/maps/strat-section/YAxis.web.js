import React from 'react';

import {Layer, Source} from 'react-map-gl';

import useYAxisHook from './useYAxis';
import useMapSymbology from '../symbology/useMapSymbology';

const YAxis = ({spotsDisplayed}) => {
  const {getLayoutSymbology} = useMapSymbology();
  const useYAxis = useYAxisHook(spotsDisplayed);

  return (
    <>
      {/* Y Axis Line */}
      <Source
        id={'yAxisSource'}
        type={'geojson'}
        data={useYAxis.getYAxis()}
      >
        <Layer
          type={'line'}
          id={'yAxisLayer'}
          minZoomLevel={1}
        />
      </Source>

      {/* Y Axis Tick Marks */}
      <Source
        id={'yAxisTickMarksSource'}
        type={'geojson'}
        data={useYAxis.getYAxisTickMarks()}
      >
        <Layer
          type={'line'}
          id={'yAxisTickMarksLayer'}
          minZoomLevel={1}
        />
        <Layer
          type={'symbol'}
          id={'yAxisTickMarksLabelLayer'}
          minZoomLevel={1}
          layout={getLayoutSymbology().yAxisTickMarkLabels}
        />
      </Source>
    </>
  );
};

export default YAxis;
