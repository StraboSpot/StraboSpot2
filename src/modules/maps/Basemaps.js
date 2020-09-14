import React, {useState} from 'react';
import {Text, View} from 'react-native';

import MapboxGL from '@react-native-mapbox-gl/maps';
import * as turf from '@turf/turf/index';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import homeStyles from '../home/home.style';
import useImagesHook from '../images/useImages';
import FreehandSketch from '../sketch/FreehandSketch';
import {symbols as symbolsConstant, geoLatLngProjection, pixelProjection, MapModes} from './maps.constants';
import useMapsHook from './useMaps';
import useMapSymbologyHook from './useMapSymbology';

function Basemap(props) {
  const customMaps = useSelector(state => state.map.customMaps);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const {mapRef, cameraRef} = props.forwardedRef;
  const [useMapSymbology] = useMapSymbologyHook();
  const [symbols, setSymbol] = useState(symbolsConstant);
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const [showZoom, setShowZoom] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(undefined);

  // Add symbology to properties of map features (not to Spots themselves) since data-driven styling
  // doesn't work for colors by tags and more complex styling
  const addSymbology = (features) => {
    return features.map(feature => {
      const symbology = useMapSymbology.getSymbology(feature);
      if (!isEmpty(symbology)) feature.properties.symbology = symbology;
      return feature;
    });
  };

  const defaultCenterCoordinates = () => {
    return props.imageBasemap ? useMaps.convertCoordinateProjections(pixelProjection, geoLatLngProjection,
      [(props.imageBasemap.width) / 2, (props.imageBasemap.height) / 2])
      : props.centerCoordinate;
  };

  // Evaluate and return appropriate center coordinates
  // if ZoomToSpot is set, then asyncMode zoomToSpot is triggered, load the map with center coordinates as the coordinates of the centroid of the selectedSpot
  // else return default center coordinates.
  const evaluateCenterCoordinates = () => {
    if (props.zoomToSpot) {
      return props.imageBasemap
        ? (
          (isEmpty(selectedSpot)
            || !isEmpty(selectedSpot) && selectedSpot.properties.image_basemap !== props.imageBasemap.id)
            ? defaultCenterCoordinates()
            : useMaps.convertCoordinateProjections(pixelProjection, geoLatLngProjection,
            turf.centroid(selectedSpot).geometry.coordinates)
        )
        : (
          ((isEmpty(selectedSpot)) || !isEmpty(selectedSpot) && selectedSpot.properties.image_basemap)
            ? defaultCenterCoordinates()
            : turf.centroid(selectedSpot).geometry.coordinates
        );
    }
    else {
      return defaultCenterCoordinates();
    }
  };

  const onZoomChange = (zoomLevel) => {
    setShowZoom(true);
    setCurrentZoom(zoomLevel);
  };

  const onRegionDidChange = () => {
    console.log('Event onRegionDidChange');
    setShowZoom(false);
    props.setSpotsInMapExtent();
  };

  return (
    <View style={{flex: 1}}>
      {showZoom && <View style={homeStyles.currentZoom}>
        <Text>Zoom: {currentZoom && currentZoom.toFixed(1)}</Text>
      </View>}
      <MapboxGL.MapView
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
        onRegionIsChanging={(args) => onZoomChange(args.properties.zoomLevel)}
        onRegionDidChange={() => onRegionDidChange()}
      >

        {/* Blue dot for user location */}
        <MapboxGL.UserLocation
          animated={false}
          visible={!props.imageBasemap && props.showUserLocation}/>

        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={props.imageBasemap ? 14 : props.zoom}
          centerCoordinate={evaluateCenterCoordinates()}
          animationDuration={0}
          maxZoomLevel={25}
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
          return customMap.overlay && customMap.isViewable && (
            <MapboxGL.RasterSource
              key={customMap.id}
              id={customMap.id}
              tileUrlTemplates={[useMaps.buildTileUrl(customMap)]}>
              <MapboxGL.RasterLayer id={customMap.id + 'Layer'}
                                    sourceID={customMap.id}
                                    belowLayerID={'pointLayerNotSelected' || 'pointLayerSelected'}
                                    style={{rasterOpacity: customMap.opacity}}/>
            </MapboxGL.RasterSource>
          );
        })}

        {/* Image Basemap background Layer */}
        {props.imageBasemap && (
          <MapboxGL.VectorSource>
            <MapboxGL.BackgroundLayer
              id='background'
              style={{backgroundColor: '#ffffff'}}
              sourceID={'imageBasemap'}
            />
          </MapboxGL.VectorSource>
        )}

        {/* Image Basemap Layer */}
        {props.imageBasemap && !isEmpty(props.coordQuad) && (
          <MapboxGL.Animated.ImageSource
            id='imageBasemap'
            coordinates={props.coordQuad}
            url={useImages.getLocalImageSrc(props.imageBasemap.id)}>
            <MapboxGL.RasterLayer id='imageBasemapLayer'
                                  style={{rasterOpacity: 1}}/>
          </MapboxGL.Animated.ImageSource>
        )}
        {(props.mapMode == MapModes.DRAW.FREEHANDPOLYGON || props.mapMode == MapModes.DRAW.FREEHANDLINE) && <FreehandSketch>
        <MapboxGL.RasterLayer id='sketchLayer'/>
        </FreehandSketch>}
        {/* Feature Layer */}
        <MapboxGL.Images
          images={symbols}
          onImageMissing={imageKey => {
            setSymbol({...symbols, [imageKey]: symbols.default_point});
          }}
        />
        <MapboxGL.ShapeSource
          id='shapeSource'
          shape={turf.featureCollection(addSymbology(props.spotsNotSelected))}
        >
          <MapboxGL.SymbolLayer
            id='pointLayerNotSelected'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().point}
          />

          {/* Need 4 different lines for the different types of line dashes since
           lineDasharray is not suppported with data-driven styling*/}
          <MapboxGL.LineLayer
            id='lineLayerNotSelected'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('solid')}
            style={useMapSymbology.getMapSymbology().line}
          />
          <MapboxGL.LineLayer
            id='lineLayerNotSelectedDotted'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotted')}
            style={useMapSymbology.getMapSymbology().lineDotted}
          />
          <MapboxGL.LineLayer
            id='lineLayerNotSelectedDashed'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dashed')}
            style={useMapSymbology.getMapSymbology().lineDashed}
          />
          <MapboxGL.LineLayer
            id='lineLayerNotSelectedDotDashed'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotDashed')}
            style={useMapSymbology.getMapSymbology().lineDotDashed}
          />

          <MapboxGL.FillLayer
            id='polygonLayerNotSelected'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
            style={useMapSymbology.getMapSymbology().polygon}
          />
        </MapboxGL.ShapeSource>

        {/* Selected Features Layer */}
        <MapboxGL.ShapeSource
          id='spotsNotSelectedSource'
          shape={turf.featureCollection(addSymbology(props.spotsSelected))}
        >
          <MapboxGL.CircleLayer
            id='pointLayerSelected'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointSelected}
          />

          {/* Need 4 different lines for the different types of line dashes since
           lineDasharray is not suppported with data-driven styling*/}
          <MapboxGL.LineLayer
            id='lineLayerSelected'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('solid')}
            style={useMapSymbology.getMapSymbology().lineSelected}
          />
          <MapboxGL.LineLayer
            id='lineLayerSelectedDotted'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotted')}
            style={useMapSymbology.getMapSymbology().lineSelectedDotted}
          />
          <MapboxGL.LineLayer
            id='lineLayerSelectedDashed'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dashed')}
            style={useMapSymbology.getMapSymbology().lineSelectedDashed}
          />
          <MapboxGL.LineLayer
            id='lineLayerSelectedDotDashed'
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotDashed')}
            style={useMapSymbology.getMapSymbology().lineSelectedDotDashed}
          />

          <MapboxGL.FillLayer
            id='polygonLayerSelected'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
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
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointDraw}
          />
          <MapboxGL.LineLayer
            id='lineLayerDraw'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'LineString']}
            style={useMapSymbology.getMapSymbology().lineDraw}
          />
          <MapboxGL.FillLayer
            id='polygonLayerDraw'
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
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
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointEdit}
          />
        </MapboxGL.ShapeSource>

      </MapboxGL.MapView>
    </View>
  );
}

export const MapLayer1 = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));

export const MapLayer2 = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));
