import React from 'react';

import {Layer, Source} from 'react-map-gl';

import useXAxis from './useXAxis';
import useMapSymbology from '../symbology/useMapSymbology';

const XAxis = ({n = 1}) => {
  const {getLayoutSymbology} = useMapSymbology();
  const {getXAxis, getXAxisTickMarks} = useXAxis(n);

  return (
    <>
      {/* X Axis Line*/}
      <Source
        id={'xAxisSource' + n}
        type={'geojson'}
        data={getXAxis()}
      >
        <Layer
          type={'line'}
          id={'xAxisLayer' + n}
          minZoomLevel={1}
        />
      </Source>

      {/* X Axis Tick Marks */}
      <Source
        id={'xAxisTickMarksSource' + n}
        type={'geojson'}
        data={getXAxisTickMarks()}
      >
        <Layer
          type={'line'}
          id={'xAxisTickMarksLayer' + n}
          minZoomLevel={1}
        />
        <Layer
          type={'symbol'}
          id={'xAxisTickMarksLabelLayer' + n}
          minZoomLevel={1}
          layout={getLayoutSymbology().xAxisTickMarkLabels}
        />
      </Source>
    </>
  );
};

export default XAxis;
