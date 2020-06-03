import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import MapboxGL from '@react-native-mapbox-gl/maps';
import * as turf from '@turf/turf/index';
import useImagesHook from '../images/useImages';
import useMapsHook from './useMaps';
import useMapSymbologyHook from './useMapSymbology';
import {isEmpty} from '../../shared/Helpers';
import {Platform} from 'react-native';

// Constants
import {symbols as symbolsConstant, geoLatLngProjection, pixelProjection} from './maps.constants';

function Basemap(props) {
  const customMaps = useSelector(state => state.map.customMaps);
  const {mapRef, cameraRef} = props.forwardedRef;
  const [useMapSymbology] = useMapSymbologyHook();
  const [symbols, setSymbol] = useState(symbolsConstant);
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();

  return <MapboxGL.MapView
    id={props.imageBasemap ? props.imageBasemap.id : props.basemap.id}
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

    {!props.imageBasemap &&
    <MapboxGL.UserLocation
      animated={false}/>}

    <MapboxGL.Camera
      ref={cameraRef}
      zoomLevel={props.imageBasemap ? 14 : 15}
      centerCoordinate={props.imageBasemap ? useMaps.convertCoordinateProjections(pixelProjection, geoLatLngProjection, [(props.imageBasemap.width) / 2, (props.imageBasemap.height) / 2]) : props.centerCoordinate}
      animationDuration={0}
      // followUserLocation={true}   // Can't follow user location if want to zoom to extent of Spots
      // followUserMode='normal'
    />

    {!props.imageBasemap && <MapboxGL.RasterSource
      id={props.basemap.id}
      tileUrlTemplates={[useMaps.buildTileUrl(props.basemap)]}
      maxZoomLevel={props.basemap.maxZoom}
      tileSize={256}
    >
      <MapboxGL.RasterLayer
        id={props.basemap.id}
        sourceID={props.basemap.id}
        style={{rasterOpacity: 1}}
      />
    </MapboxGL.RasterSource>}

    {/* Custom Overlay Layer */}
    {Object.values(customMaps).map(customMap => {
      return customMap.overlay && customMap.isViewable &&
        <MapboxGL.RasterSource
          key={customMap.id}
          id={customMap.id}
          tileUrlTemplates={[useMaps.buildTileUrl(customMap)]}>
          <MapboxGL.RasterLayer id={customMap.id + 'Layer'}
                                sourceID={customMap.id}
                                style={{rasterOpacity: customMap.opacity}}/>
        </MapboxGL.RasterSource>;
    })}

    {/* Image Basemap background Layer */}
    {Platform.OS === 'android' && props.imageBasemap &&
    <MapboxGL.BackgroundLayer
      id='background'
      style={{backgroundColor: '#ffffff'}}/>
    }

    {Platform.OS === 'ios' && props.imageBasemap &&
    <MapboxGL.Animated.ImageSource
      id='imageBasemapBackground'
      coordinates={[[-250, 85], [250, 85], [250, -85], [-250, -85]]}
      url={require('../../assets/images/imageBasemapBackground.jpg')}>
      <MapboxGL.RasterLayer id='imageBasemapBackgroundLayer'
                            style={{rasterOpacity: 1}}/>
    </MapboxGL.Animated.ImageSource>}

    {/* Image Basemap Layer */}
    {props.imageBasemap && !isEmpty(props.coordQuad) &&
    <MapboxGL.Animated.ImageSource
      id='imageBasemap'
      coordinates={props.coordQuad}
      url={useImages.getLocalImageSrc(props.imageBasemap.id)}>
      <MapboxGL.RasterLayer id='imageBasemapLayer'
                            style={{rasterOpacity: 1}}/>
    </MapboxGL.Animated.ImageSource>}

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

export const MapLayer1 = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));

export const MapLayer2 = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));
