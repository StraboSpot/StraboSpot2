import React from 'react';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';

function CoveredIntervalsXLines(props) {

  // Create the X lines for Strat Intervals that are Covered/Unexposed or Not Measured
  const getIntervalsWithX = () => {
    const spotsX = props.spotsDisplayed.filter(
      s => s.properties?.sed?.character === 'unexposed_cove' || s.properties?.sed?.character === 'not_measured');
    const xLines = [];
    spotsX.forEach(s => {
      const bbox = turf.bbox(s);
      const poly = turf.bboxPolygon(bbox);
      const coords = turf.getCoords(poly);
      xLines.push(turf.lineString([coords[0][0], coords[0][2]]));
      xLines.push(turf.lineString([coords[0][1], coords[0][3]]));
    });
    return xLines;
  };

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
}

export default (CoveredIntervalsXLines);
