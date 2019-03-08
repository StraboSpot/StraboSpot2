import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import pointSymbol from "../../assets/symbols/point.png";

function Basemap(props) {
  return <MapboxGL.MapView
    id={props.basemap.id}
    ref={props.forwardedRef}
    style={{flex: 1}}
    animated={true}
    localizeLabels={true}
    //showUserLocation={true}
    logoEnabled={false}
    rotateEnabled={false}
    attributionEnabled={false}
    compassEnabled={false}
    centerCoordinate={props.centerCoordinate}
    zoomLevel={16}
    onPress={props.onMapPress}
    onLongPress={props.onMapLongPress}
    scrollEnabled={true}
  >
    <MapboxGL.RasterSource
      id={props.basemap.id}
      url={props.basemap.url}
      maxZoomLevel={props.basemap.maxZoom}
      tileSize={256}
    >
      <MapboxGL.RasterLayer
        id={props.basemap.layerId}
        sourceID={props.basemap.id}
        style={{rasterOpacity: 1}}
      />
    </MapboxGL.RasterSource>
    <MapboxGL.ShapeSource
      id="shapeSource"
      //hitbox={{ width: 20, height: 20 }}
      //onPress={props.onSourcePress}
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
    <MapboxGL.ShapeSource
      id="selectedFeaturseSource"
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
        style={mapStyles.line}
      />
      <MapboxGL.FillLayer
        id="polygonLayerSelected"
        minZoomLevel={1}
        filter={['==', '$type', 'Polygon']}
        style={mapStyles.polygon}
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

const mapStyles = MapboxGL.StyleSheet.create({
  point: {
    iconImage: pointSymbol,
    iconAllowOverlap: true,
    iconSize: 0.15,
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
    fillOpacity: .4
  },
});