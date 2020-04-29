import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import MapboxGL from '@react-native-mapbox-gl/maps';
import * as turf from '@turf/turf/index';

import useMapSymbologyHook from './useMapSymbology';

// Constants
import {symbols as symbolsConstant} from './maps.constants';

function Basemap(props) {
  const basemap = useSelector(state => state.map.currentBasemap);
  const {mapRef, cameraRef} = props.forwardedRef;
  const [useMapSymbology] = useMapSymbologyHook();
  const [symbols, setSymbol] = useState(symbolsConstant);
  return <MapboxGL.MapView
    id={basemap.id}
    ref={mapRef}
    style={{flex: 1}}
    animated={true}
    localizeLabels={true}
    logoEnabled={false}
    rotateEnabled={false}
    pitchEnable={false}
    attributionEnabled={false}
    compassEnabled={true}
    onPress={props.onMapPress}
    onLongPress={props.onMapLongPress}
    scrollEnabled={props.allowMapViewMove}
    zoomEnabled={props.allowMapViewMove}
  >
    <MapboxGL.UserLocation
      animated={false}/>
    <MapboxGL.Camera
      ref={cameraRef}
      zoomLevel={15}
      centerCoordinate={props.centerCoordinate}
      // followUserLocation={true}   // Can't follow user location if want to zoom to extent of Spots
      // followUserMode='normal'
    />
    <MapboxGL.RasterSource
      id={basemap.id}
      tileUrlTemplates={[basemap.url]}
      maxZoomLevel={basemap.maxZoom}
      tileSize={256}
    >
      <MapboxGL.RasterLayer
        id={basemap.layerId}
        sourceID={basemap.id}
        style={{rasterOpacity: 1}}
      />
    </MapboxGL.RasterSource>
    {/* Feature Layer */}
    <MapboxGL.Images
      images={symbols}
      onImageMissing={imageKey => {
        setSymbol({...symbols, [imageKey]: symbols.default_point});
      }}
    />
    <MapboxGL.ShapeSource
      id='shapeSource'
      shape={turf.featureCollection(props.spotsNotSelected)}
    >
      <MapboxGL.SymbolLayer
        id='pointLayerNotSelected'
        minZoomLevel={1}
        filter={['==', '$type', 'Point']}
        style={useMapSymbology.getMapSymbology().point}
      />
      <MapboxGL.LineLayer
        id='lineLayerNotSelected'
        minZoomLevel={1}
        filter={['==', '$type', 'LineString']}
        style={useMapSymbology.getMapSymbology().line}
      />
      <MapboxGL.FillLayer
        id='polygonLayerNotSelected'
        minZoomLevel={1}
        filter={['==', '$type', 'Polygon']}
        style={useMapSymbology.getMapSymbology().polygon}
      />
    </MapboxGL.ShapeSource>
    {/* Selected Features Layer */}
    <MapboxGL.ShapeSource
      id='spotsNotSelectedSource'
      shape={turf.featureCollection(props.spotsSelected)}
    >
      <MapboxGL.CircleLayer
        id='pointLayerSelected'
        minZoomLevel={1}
        filter={['==', '$type', 'Point']}
        style={useMapSymbology.getMapSymbology().pointSelected}
      />
      <MapboxGL.LineLayer
        id='lineLayerSelected'
        minZoomLevel={1}
        filter={['==', '$type', 'LineString']}
        style={useMapSymbology.getMapSymbology().lineSelected}
      />
      <MapboxGL.FillLayer
        id='polygonLayerSelected'
        minZoomLevel={1}
        filter={['==', '$type', 'Polygon']}
        style={useMapSymbology.getMapSymbology().polygonSelected}
      />
    </MapboxGL.ShapeSource>
    {/* Draw Layer */}
    <MapboxGL.ShapeSource
      id='drawFeatures'
      shape={turf.featureCollection(props.drawFeatures)}
    >
      <MapboxGL.CircleLayer
        id='pointLayerDraw'
        minZoomLevel={1}
        filter={['==', '$type', 'Point']}
        style={useMapSymbology.getMapSymbology().pointDraw}
      />
      <MapboxGL.LineLayer
        id='lineLayerDraw'
        minZoomLevel={1}
        filter={['==', '$type', 'LineString']}
        style={useMapSymbology.getMapSymbology().lineDraw}
      />
      <MapboxGL.FillLayer
        id='polygonLayerDraw'
        minZoomLevel={1}
        filter={['==', '$type', 'Polygon']}
        style={useMapSymbology.getMapSymbology().polygonDraw}
      />
    </MapboxGL.ShapeSource>
    {/* Edit Layer */}
    <MapboxGL.ShapeSource
      id='editFeatureVertex'
      shape={turf.featureCollection(props.editFeatureVertex)}
    >
      <MapboxGL.CircleLayer
        id='pointLayerEdit'
        minZoomLevel={1}
        filter={['==', '$type', 'Point']}
        style={useMapSymbology.getMapSymbology().pointEdit}
      />
    </MapboxGL.ShapeSource>
  </MapboxGL.MapView>;
}

export const MapboxOutdoorsBasemap = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));

export const MapboxSatelliteBasemap = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));

export const MacrostratBasemap = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));

export const OSMBasemap = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));

export const CustomBasemap = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));

export const mapStyles = {
  point: {
    circleRadius: 7,
    circleColor: 'black',
    circleOpacity: 1,
    // iconImage: pointSymbol,
    // iconAllowOverlap: true,
    // iconSize: 0.5,
  },
  line: {
    lineColor: 'black',
    lineWidth: 3,
  },
  polygon: {
    fillColor: 'blue',
    fillOpacity: 0.4,
  },
  pointSelected: {
    circleRadius: 20,
    circleColor: 'orange',
    circleOpacity: 0.4,
  },
  lineSelected: {
    lineColor: 'orange',
    lineWidth: 3,
  },
  polygonSelected: {
    fillColor: 'orange',
    fillOpacity: 0.7,
  },
  pointDraw: {
    circleRadius: 5,
    circleColor: 'orange',
    circleStrokeColor: 'white',
    circleStrokeWidth: 2,
  },
  lineDraw: {
    lineColor: 'orange',
    lineWidth: 3,
    lineDasharray: [2, 2],
  },
  polygonDraw: {
    fillColor: 'orange',
    fillOpacity: 0.4,
  },
  pointEdit: {
    circleRadius: 10,
    circleColor: 'orange',
    circleStrokeColor: 'white',
    circleStrokeWidth: 2,
  },
};
