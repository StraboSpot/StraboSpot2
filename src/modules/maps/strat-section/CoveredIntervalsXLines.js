import React from 'react';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';

import useCoveredIntervalXLines from './useCoveredIntevalsXLines';

const CoveredIntervalsXLines = ({spotsDisplayed}) => {
  const {getIntervalsWithX} = useCoveredIntervalXLines(spotsDisplayed);

  return (
    <MapboxGL.ShapeSource
      id={'coveredIntervalLines'}
      shape={turf.featureCollection(getIntervalsWithX())}
    >
      <MapboxGL.LineLayer
        id={'coveredIntervalLinesLayer'}
        minZoomLevel={1}
      />
    </MapboxGL.ShapeSource>
  );
};

export default CoveredIntervalsXLines;
