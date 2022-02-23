import React from 'react';

import MapboxGL from '@react-native-mapbox-gl/maps';
import * as turf from '@turf/turf';

import {useFormHook} from '../../form';
import useMapsHook from '../useMaps';
import {BASIC_LITHOLOGIES_LABELS, CARBONATE_KEYS, GRAIN_SIZE_KEYS, LITHOLOGIES_KEYS} from './stratSection.constants';
import useStratSectionSymbologyHook from './useStratSectionSymbology';

function XAxis(props) {
  const useStratSectionSymbology = useStratSectionSymbologyHook();
  const [useMaps] = useMapsHook();
  const [useForm] = useFormHook();

  const xCl = 10;  // Horizontal spacing between clastic tick marks
  const xCa = 23.3; // Horizonatal space between carbonate tick marks
  const xMi = 26.6; // Horizonatal space between miscelaneous lithologies tick marks
  const s = 20; // spacing between multiple x axes

  const lineString = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [],
    },
  };

  const getXAxis = (n = 1) => {
    const xAxis = JSON.parse(JSON.stringify(lineString));
    xAxis.geometry.coordinates = n === 1 ? [[0, 0], [15 * xCl + 5, 0]] : [[0, -n * s], [15 * xCl + 5, -n * s]];
    return useMaps.convertImagePixelsToLatLong(xAxis);
  };

  const getXAxisTickMarks = (n = 1) => {
    const survey = useForm.getSurvey(['sed', 'add_interval']);
    const choices = useForm.getChoices(['sed', 'add_interval']);
    let fieldKeys = [];
    let x = xCl;
    if (props.stratSection.column_profile === 'clastic') fieldKeys = GRAIN_SIZE_KEYS;
    else if (props.stratSection.column_profile === 'carbonate') {
      fieldKeys = CARBONATE_KEYS;
      x = xCa;
    }
    else if (props.stratSection.column_profile === 'mixed_clastic') {
      if (n === 1) fieldKeys = GRAIN_SIZE_KEYS;
      else if (n === 2) {
        fieldKeys = CARBONATE_KEYS;
        x = xCa;
      }
    }
    if (props.misc) {
      fieldKeys = LITHOLOGIES_KEYS;
      x = xMi;
    }

    const fields = survey.reduce((acc, key) => {
      return fieldKeys.includes(key.name) ? [...acc, ...useForm.getChoicesByKey(survey, choices, key.name)] : acc;
    }, []);
    const labels = props.stratSection.column_profile === 'basic_lithologies' ? BASIC_LITHOLOGIES_LABELS
      : fields.map(f => f.label);

    if (props.misc) labels.splice(0, 3);      // Remove first 3 labels if misc

    const tickMarks = [];
    Array.from({length: labels.length}, (_, i) => {
      const tickMark = JSON.parse(JSON.stringify(lineString));
      tickMark.properties.label = labels[i];
      tickMark.geometry.coordinates = n === 1 ? [[x, 0], [x, -5]] : [[x, n * -s], [x, n * -s - 5]];
      tickMarks.push(useMaps.convertImagePixelsToLatLong(tickMark));
      x += xCl;
    });
    return turf.featureCollection(tickMarks);
  };

  return (
    <React.Fragment>

      {/* X Axis Line*/}
      <MapboxGL.ShapeSource
        id={'xAxisSource' + props.n}
        shape={getXAxis(props.n)}
      >
        <MapboxGL.LineLayer
          id={'xAxisLayer' + props.n}
          minZoomLevel={1}
        />
      </MapboxGL.ShapeSource>

      {/* X Axis Tick Marks */}
      <MapboxGL.ShapeSource
        id={'xAxisTickMarksSource' + props.n}
        shape={getXAxisTickMarks(props.n)}
      >
        <MapboxGL.LineLayer
          id={'xAxisTickMarksLayer' + props.n}
          minZoomLevel={1}
        />
        <MapboxGL.SymbolLayer
          id={'xAxisTickMarksLabelLayer' + props.n}
          minZoomLevel={1}
          style={useStratSectionSymbology.getStratStyle().xAxisTickMarkLabels}
        />
      </MapboxGL.ShapeSource>

    </React.Fragment>
  );
}

export default (XAxis);
