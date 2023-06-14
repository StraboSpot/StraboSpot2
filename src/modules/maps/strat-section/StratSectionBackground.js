import React, {useEffect} from 'react';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import proj4 from 'proj4';

import useImagesHook from '../../images/useImages';
import useSpotsHook from '../../spots/useSpots';
import {GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION} from '../maps.constants';
import useMapsHook from '../useMaps';
import useStratSectionSymbologyHook from './useStratSectionSymbology';
import XAxis from './XAxis';

const StratSectionBackground = (props) => {
  const useStratSectionSymbology = useStratSectionSymbologyHook();
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
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

      {/* Background */}
      <MapboxGL.VectorSource>
        <MapboxGL.BackgroundLayer
          id={'background'}
          style={{backgroundColor: '#ffffff'}}
          sourceID={'stratSection'}
        />
      </MapboxGL.VectorSource>

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
          <MapboxGL.Animated.ImageSource
            key={'imageOverlay' + oI.id}
            id={'imageOverlay' + oI.id}
            coordinates={coordQuad}
            url={useImages.getLocalImageURI(image.id)}>
            <MapboxGL.RasterLayer
              id={'imageOverlayLayer' + oI.id}
              style={{rasterOpacity: oI.image_opacity || 1}}
            />
          </MapboxGL.Animated.ImageSource>
        );
      })}

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
