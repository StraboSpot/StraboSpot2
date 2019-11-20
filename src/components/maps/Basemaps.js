import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import pointSymbol from "../../assets/symbols/point-resizeimage.png";

function Basemap(props) {
  const {mapRef, cameraRef} = props.forwardedRef;
  return <MapboxGL.MapView
    id={props.basemap.id}
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
    <MapboxGL.UserLocation/>
    <MapboxGL.Camera
      ref={cameraRef}
      zoomLevel={16}
      centerCoordinate={props.centerCoordinate}
      followUserLocation={true}
      followUserMode="normal"
    />
    <MapboxGL.RasterSource
      id={props.basemap.id}
      tileUrlTemplates={[props.basemap.url]}
      maxZoomLevel={props.basemap.maxZoom}
      tileSize={256}
    >
      <MapboxGL.RasterLayer
        id={props.basemap.layerId}
        sourceID={props.basemap.id}
        style={{rasterOpacity: 1}}
      />
    </MapboxGL.RasterSource>
    {/* Feature Layer */}
    <MapboxGL.ShapeSource
      id="shapeSource"
      shape={props.features}
    >
      <MapboxGL.SymbolLayer
        id="pointLayer"
        minZoomLevel={1}
        filter={['==', '$type', 'Point']}
        style={mapStyles.point}
      />
      <MapboxGL.LineLayer
        id="lineLayer"
        minZoomLevel={1}
        filter={['==', '$type', 'LineString']}
        style={mapStyles.line}
      />
      <MapboxGL.FillLayer
        id="polygonLayer"
        minZoomLevel={1}
        filter={['==', '$type', 'Polygon']}
        style={mapStyles.polygon}
      />
    </MapboxGL.ShapeSource>
    {/* Selected Features Layer */}
    <MapboxGL.ShapeSource
      id="selectedFeaturesSource"
      shape={props.selectedFeatures}
    >
      <MapboxGL.CircleLayer
        id="pointLayerSelected"
        minZoomLevel={1}
        filter={['==', '$type', 'Point']}
        style={mapStyles.pointSelected}
      />
      <MapboxGL.LineLayer
        id="lineLayerSelected"
        minZoomLevel={1}
        filter={['==', '$type', 'LineString']}
        style={mapStyles.lineSelected}
      />
      <MapboxGL.FillLayer
        id="polygonLayerSelected"
        minZoomLevel={1}
        filter={['==', '$type', 'Polygon']}
        style={mapStyles.polygonSelected}
      />
    </MapboxGL.ShapeSource>
    {/* Draw Layer */}
    <MapboxGL.ShapeSource
      id="drawFeatures"
      shape={props.drawFeatures}
    >
      <MapboxGL.CircleLayer
        id="pointLayerDraw"
        minZoomLevel={1}
        filter={['==', '$type', 'Point']}
        style={mapStyles.pointDraw}
      />
      <MapboxGL.LineLayer
        id="lineLayerDraw"
        minZoomLevel={1}
        filter={['==', '$type', 'LineString']}
        style={mapStyles.lineDraw}
      />
      <MapboxGL.FillLayer
        id="polygonLayerDraw"
        minZoomLevel={1}
        filter={['==', '$type', 'Polygon']}
        style={mapStyles.polygonDraw}
      />
    </MapboxGL.ShapeSource>
    {/* Edit Layer */}
    <MapboxGL.ShapeSource
      id="editFeatureVertex"
      shape={props.editFeatureVertex}
    >
      <MapboxGL.CircleLayer
        id="pointLayerEdit"
        minZoomLevel={1}
        filter={['==', '$type', 'Point']}
        style={mapStyles.pointEdit}
      />
    </MapboxGL.ShapeSource>
  </MapboxGL.MapView>
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

const mapStyles = {
  point: {
    iconImage: pointSymbol,
    iconAllowOverlap: true,
    iconSize: 0.5,
  },
  line: {
    lineColor: 'black',
    lineWidth: 3
  },
  polygon: {
    fillColor: 'blue',
    fillOpacity: .4
  },
  pointSelected: {
    circleRadius: 30,
    circleColor: 'orange',
    circleOpacity: .4
  },
  lineSelected: {
    lineColor: 'orange',
    lineWidth: 3
  },
  polygonSelected: {
    fillColor: 'orange',
    fillOpacity: .7
  },
  pointDraw: {
    circleRadius: 5,
    circleColor: 'orange',
    circleStrokeColor: 'white',
    circleStrokeWidth: 2
  },
  lineDraw: {
    lineColor: 'orange',
    lineWidth: 3,
    lineDasharray: [2, 2]
  },
  polygonDraw: {
    fillColor: 'orange',
    fillOpacity: .4
  },
  pointEdit: {
    circleRadius: 10,
    circleColor: 'orange',
    circleStrokeColor: 'white',
    circleStrokeWidth: 2
  }
};
