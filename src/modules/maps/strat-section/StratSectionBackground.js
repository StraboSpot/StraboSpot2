import React from 'react';

import MapboxGL from '@react-native-mapbox-gl/maps';
import * as turf from '@turf/turf';

import {GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION} from '../maps.constants';
import useMapsHook from '../useMaps';
import useStratSectionSymbologyHook from './useStratSectionSymbology';

function StratSectionBackground(props) {
  const useStratSectionSymbology = useStratSectionSymbologyHook();
  const [useMaps] = useMapsHook();

  const lineString = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [],
    },
  };

  const getXAxis = () => {
    const xAxis = JSON.parse(JSON.stringify(lineString));
    xAxis.geometry.coordinates = [[0, 0], [props.maxXY[0] + 0.00025, 0]];
    return xAxis;
  };

  const getYAxis = () => {
    const yAxis = JSON.parse(JSON.stringify(lineString));
    yAxis.geometry.coordinates = [[0, 0], [0, props.maxXY[1] + 0.00025]];
    return yAxis;
  };

  const getYAxisTickMarks = () => {
    const yMaxCoord = useMaps.convertCoordinateProjections(GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION,
      [0, props.maxXY[1] + 0.00025]);
    const yMax = yMaxCoord[1];
    const tickMarks = [];
    let y = 0;
    while (y <= yMax) {
      const tickMark = JSON.parse(JSON.stringify(lineString));
      tickMark.properties.label = y / 20;
      tickMark.geometry.coordinates = [[0, y], [-5, y]];
      tickMarks.push(useMaps.convertImagePixelsToLatLong(tickMark));
      y += 20;
    }
    return turf.featureCollection(tickMarks);
  };

  return (
    <React.Fragment>

      {/* Background */}
      <MapboxGL.VectorSource>
        <MapboxGL.BackgroundLayer
          id={'background'}
          style={{backgroundColor: '#ffffff'}}
          sourceID={'stratSection'}
        />
      </MapboxGL.VectorSource>

      {/* Y Axis Line */}
      <MapboxGL.ShapeSource
        id={'yAxisSource'}
        shape={getYAxis()}
      >
        <MapboxGL.LineLayer
          id={'yAxisLayer'}
          minZoomLevel={1}
        />
      </MapboxGL.ShapeSource>

      {/* Y Axis Tick Marks */}
      <MapboxGL.ShapeSource
        id={'yAxisTickMarksSource'}
        shape={getYAxisTickMarks()}
      >
        <MapboxGL.LineLayer
          id={'yAxisTickMarksLayer'}
          minZoomLevel={1}
        />
        <MapboxGL.SymbolLayer
          id={'yAxisTickMarksLabelLayer'}
          minZoomLevel={1}
          style={useStratSectionSymbology.getStratStyle().yAxisTickMarkLabels}
        />
      </MapboxGL.ShapeSource>

      {/* X Axis Line*/}
      <MapboxGL.ShapeSource
        id={'xAxisSource'}
        shape={getXAxis()}
      >
        <MapboxGL.LineLayer
          id={'xAxisLayer'}
          minZoomLevel={1}
        />
      </MapboxGL.ShapeSource>

    </React.Fragment>
  );
}

export default (StratSectionBackground);
