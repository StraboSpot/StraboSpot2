import React from 'react';

import * as turf from '@turf/turf';
import {Layer, Source} from 'react-map-gl';

import useCoveredIntervalXLinesHook from './useCoveredIntevalsXLines';

const CoveredIntervalsXLines = ({spotsDisplayed}) => {
  const useCoveredIntervalXLines = useCoveredIntervalXLinesHook(spotsDisplayed);

  return (
    <Source
      id={'coveredIntervalLines'}
      type={'geojson'}
      data={turf.featureCollection(useCoveredIntervalXLines.getIntervalsWithX())}
    >
      <Layer
        type={'line'}
        id={'coveredIntervalLinesLayer'}
        minZoomLevel={1}
      />
    </Source>
  );
};

export default CoveredIntervalsXLines;
