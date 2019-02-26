import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

function Basemap(props) {
  return <MapboxGL.MapView
    id={props.basemap.id}
    ref={props.forwardedRef}
    style={{flex: 1}}
    animated={true}
    localizeLabels={true}
    showUserLocation={true}
    logoEnabled={false}
    rotateEnabled={false}
    attributionEnabled={false}
    compassEnabled={false}
    centerCoordinate={props.centerCoordinate}
    zoomLevel={16}
    onPress={props.onPress}
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
