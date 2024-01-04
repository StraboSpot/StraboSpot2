import React from 'react';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';

import useCoveredIntervalXLinesHook from './useCoveredIntevalsXLines';

const CoveredIntervalsXLines = ({spotsDisplayed}) => {
  const useCoveredIntervalXLines = useCoveredIntervalXLinesHook(spotsDisplayed);

  return (
    <MapboxGL.ShapeSource
      id={'coveredIntervalLines'}
      shape={turf.featureCollection(useCoveredIntervalXLines.getIntervalsWithX())}
    >
      <MapboxGL.LineLayer
        id={'coveredIntervalLinesLayer'}
        minZoomLevel={1}
      />
    </MapboxGL.ShapeSource>
  );
};

export default CoveredIntervalsXLines;
