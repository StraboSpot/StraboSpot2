import React, {useEffect} from 'react';

import * as turf from '@turf/turf';
import proj4 from 'proj4';
import {Layer, Source} from 'react-map-gl';

import XAxis from './XAxis';
import useImagesHook from '../../images/useImages';
import useSpotsHook from '../../spots/useSpots';
import {GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION} from '../maps.constants';
import useMapSymbologyHook from '../symbology/useMapSymbology';
import useMapsHook from '../useMaps';

const StratSectionBackground = (props) => {
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const [useMapSymbology] = useMapSymbologyHook();
  const [useSpots] = useSpotsHook();

  const stratSectionSpot = useSpots.getSpotWithThisStratSection(props.stratSection.strat_section_id);
  const stratSectionImagesSorted = JSON.parse(JSON.stringify(props.stratSection.images || [])).sort(
    (a, b) => a.z_index - b.z_index);

  useEffect(() => {

  }, [props.stratSection]);

  const yMultiplier = 20;  // 1 m interval thickness = 20 pixels

  const lineString = {
    type: 'Feature', properties: {}, geometry: {
      type: 'LineString', coordinates: [],
    },
  };

  const getYAxis = () => {
    const yAxis = JSON.parse(JSON.stringify(lineString));
    yAxis.geometry.coordinates = [[0, 0], [0, props.maxXY[1] + 0.00025]];
    return yAxis;
  };

  const getYAxisTickMarks = () => {
    const yMaxCoord = proj4(GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION, [0, props.maxXY[1] + 0.00025]);
    const yMax = yMaxCoord[1];
    const tickMarks = [];
    let y = 0;
    while (y <= yMax) {
      const tickMark = JSON.parse(JSON.stringify(lineString));
      tickMark.properties.label = y / yMultiplier;
      tickMark.geometry.coordinates = [[0, y], [-5, y]];
      tickMarks.push(useMaps.convertImagePixelsToLatLong(tickMark));
      y += yMultiplier;
    }
    return turf.featureCollection(tickMarks);
  };

  return (
    <React.Fragment>

      {/* Image Overlay Layers */}
      {stratSectionImagesSorted.map((oI) => {
        // const coordQuad = [topLeft, topRight, bottomRight, bottomLeft];
        const image = stratSectionSpot.properties.images.find(i => i.id === oI.id);
        let imageCopy = JSON.parse(JSON.stringify(image));
        if (oI.image_height) imageCopy.height = oI.image_height;
        if (oI.image_width) imageCopy.width = oI.image_width;
        const coordQuad = useMaps.getCoordQuad(imageCopy, {x: oI.image_origin_x, y: oI.image_origin_y});
        console.log('overlayimage coordQuad', coordQuad);
        return (
          <Source
            key={'imageOverlay' + oI.id}
            id={'imageOverlay' + oI.id}
            type={'image'}
            coordinates={coordQuad}
            url={useImages.getLocalImageURI(image.id)}>
            <Layer
              type={'raster'}
              id={'imageOverlayLayer' + oI.id}
              style={{rasterOpacity: oI.image_opacity || 1}}
            />
          </Source>
        );
      })}

      {/* Y Axis Line */}
      <Source
        id={'yAxisSource'}
        type={'geojson'}
        data={getYAxis()}
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
        data={getYAxisTickMarks()}
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
          layout={useMapSymbology.getLayoutSymbology().yAxisTickMarkLabels}
        />
      </Source>

      {/* X Axes */}
      <XAxis stratSection={props.stratSection}/>
      {props.stratSection.column_profile === 'mixed_clastic' && (
        <React.Fragment>
          <XAxis stratSection={props.stratSection} n={2}/>
          {props.stratSection.misc_labels && <XAxis stratSection={props.stratSection} n={4} misc={true}/>}
        </React.Fragment>
      )}
      {props.stratSection.misc_labels && <XAxis stratSection={props.stratSection} n={2} misc={true}/>}
    </React.Fragment>
  );
};

export default (StratSectionBackground);
