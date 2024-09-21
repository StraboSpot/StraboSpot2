import React from 'react';

import * as turf from '@turf/turf';
import {Layer, Source} from 'react-map-gl';

import useCoveredIntervalXLines from './useCoveredIntevalsXLines';

const CoveredIntervalsXLines = ({spotsDisplayed}) => {
  const {getIntervalsWithX} = useCoveredIntervalXLines(spotsDisplayed);

  return (
    <Source
      id={'coveredIntervalLines'}
      type={'geojson'}
      data={turf.featureCollection(getIntervalsWithX())}
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
