import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import MapboxGL from '@react-native-mapbox-gl/maps';
import * as turf from '@turf/turf';
import proj4 from 'proj4';
import ScaleBar from 'react-native-map-scale-bar';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import homeStyles from '../home/home.style';
import useImagesHook from '../images/useImages';
import FreehandSketch from '../sketch/FreehandSketch';
import {GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION} from './maps.constants';
import CoveredIntervalsXLines from './strat-section/CoveredIntervalsXLines';
import {STRAT_PATTERNS} from './strat-section/stratSection.constants';
import StratSectionBackground from './strat-section/StratSectionBackground';
import {MAP_SYMBOLS} from './symbology/mapSymbology.constants';
import useMapSymbologyHook from './symbology/useMapSymbology';
import useMapsHook from './useMaps';

function Basemap(props) {
  const customMaps = useSelector(state => state.map.customMaps);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const {mapRef, cameraRef} = props.forwardedRef;
  const [useMapSymbology] = useMapSymbologyHook();
  const [symbols, setSymbol] = useState({...MAP_SYMBOLS, ...STRAT_PATTERNS});
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const [currentZoom, setCurrentZoom] = useState(0);
  const [center, setCenter] = useState([0, 0]);
  const [doesImageExist, setDoesImageExist] = useState(false);

  useEffect(() => {
    console.log('UE Basemap [props.imageBasemap]', props.imageBasemap);
    if (props.imageBasemap && props.imageBasemap.id) checkImageExistance().catch(console.error);
  }, [props.imageBasemap]);

  const checkImageExistance = async () => {
    return useImages.doesImageExistOnDevice(props.imageBasemap.id).then((doesExist) => setDoesImageExist(doesExist));
  };

  useEffect(() => {
    console.log('UE Basemap [currentZoom]', currentZoom);
    getCenter();
  }, [currentZoom]);

  const getCenter = async () => {
    setCenter(await mapRef.current.getCenter());
  };

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
    return props.imageBasemap ? proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION,
        [(props.imageBasemap.width) / 2, (props.imageBasemap.height) / 2])
      : props.centerCoordinate;
  };

  // Evaluate and return appropriate center coordinates
  const evaluateCenterCoordinates = () => {
    if (props.stratSection) return [.001, .0007];
    else if (props.zoomToSpot && !isEmpty(selectedSpot)) {
      if (props.imageBasemap && selectedSpot.properties.image_basemap === props.imageBasemap.id) {
        return proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION, turf.centroid(selectedSpot).geometry.coordinates);
      }
      else if (!selectedSpot.properties.image_basemap) return turf.centroid(selectedSpot).geometry.coordinates;
    }
    return defaultCenterCoordinates();
  };

  // Get max X and max Y for strat intervals
  const getStratIntervalsMaxXY = () => {
    const intervals = [...props.spotsSelected, ...props.spotsNotSelected].filter(
      feature => feature?.properties?.surface_feature?.surface_feature_type === 'strat_interval');
    return intervals.reduce((acc, i) => {
      const coords = i.geometry.coordinates || i.geometry.geometries.map(g => g.coordinates).flat();
      const xs = coords.flat().map(c => c[0]);
      const maxX = Math.max(...xs);
      const ys = coords.flat().map(c => c[1]);
      const maxY = Math.max(...ys);
      return [Math.max(acc[0], maxX), Math.max(acc[1], maxY)];
    }, [0, 0]);
  };

  const mapZoomLevel = async () => {
    const zoom = await mapRef.current.getZoom();
    setCurrentZoom(zoom.toFixed(1));
  };

  const setInitialZoomLevel = () => {
    if (props.imageBasemaps) return 14;
    if (props.stratSection) return 18;
    return props.zoom;
  };

  const onRegionDidChange = () => {
    console.log('Event onRegionDidChange');
    props.spotsInMapExtent();
  };

  return (
    <View style={{flex: 1}}>
      <View style={homeStyles.zoomAndScaleBarContainer}>
          <Text style={props.basemap.id === 'mapbox.satellite' ? homeStyles.currentZoomTextWhite
            : homeStyles.currentZoomTextBlack}>
            Zoom: {currentZoom}
          </Text>
        <ScaleBar  zoom={currentZoom} latitude={center[1]}/>
      </View>
      <MapboxGL.MapView
        id={props.imageBasemap ? props.imageBasemap.id : props.stratSection ? props.stratSection.strat_section_id : props.basemap.id}
        ref={mapRef}
        style={{flex: 1}}
        styleURL={!props.imageBasemap && !props.stratSection && JSON.stringify(props.basemap)}
        animated={true}
        localizeLabels={true}
        logoEnabled={true}
        logoPosition={homeStyles.mapboxLogoPosition}
        rotateEnabled={false}
        pitchEnabled={!(props.stratSection || props.imageBasemap)}
        attributionEnabled={true}
        attributionPosition={homeStyles.mapboxAttributionPosition}
        onPress={props.onMapPress}
        onLongPress={props.onMapLongPress}
        scrollEnabled={props.allowMapViewMove}
        zoomEnabled={props.allowMapViewMove}
        onDidFinishLoadingMap={mapZoomLevel}
        onRegionIsChanging={mapZoomLevel}
        onRegionDidChange={onRegionDidChange}
      >

        {/* Blue dot for user location */}
        <MapboxGL.UserLocation
          animated={false}
          visible={!props.imageBasemap && !props.stratSection && props.showUserLocation}
        />

        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={setInitialZoomLevel()}
          centerCoordinate={evaluateCenterCoordinates()}
          animationDuration={0}
          // followUserLocation={true}   // Can't follow user location if want to zoom to extent of Spots
          // followUserMode='normal'
        />

        {/* Custom Overlay Layer */}
        {Object.values(customMaps).map(customMap => {
          return (
            customMap.overlay && customMap.isViewable && (
              <MapboxGL.RasterSource
                key={customMap.id}
                id={customMap.id}
                tileUrlTemplates={[useMaps.buildTileUrl(customMap)]}>
                <MapboxGL.RasterLayer id={customMap.id + 'Layer'}
                                      sourceID={customMap.id}
                                      belowLayerID={'pointLayerNotSelected' || 'pointLayerSelected'}
                                      style={{rasterOpacity: customMap.opacity}}/>
              </MapboxGL.RasterSource>
            )
          );
        })}

        {/* Image Basemap background Layer */}
        {props.imageBasemap && (
          <MapboxGL.VectorSource>
            <MapboxGL.BackgroundLayer
              id={'background'}
              style={{backgroundColor: '#ffffff'}}
              sourceID={'imageBasemap'}
            />
          </MapboxGL.VectorSource>
        )}

        {/* Strat Section background Layer */}
        {props.stratSection && (
          <StratSectionBackground maxXY={getStratIntervalsMaxXY()} stratSection={props.stratSection}/>
        )}

        {/* Image Basemap Layer */}
        {props.imageBasemap && !isEmpty(props.coordQuad) && doesImageExist && (
          <MapboxGL.Animated.ImageSource
            id={'imageBasemap'}
            coordinates={props.coordQuad}
            url={useImages.getLocalImageURI(props.imageBasemap.id)}>
            <MapboxGL.RasterLayer
              id={'imageBasemapLayer'}
              style={{rasterOpacity: 1}}
            />
          </MapboxGL.Animated.ImageSource>
        )}

        {/* Sketch Layer */}
        {(props.freehandSketchMode)
          && (
            <FreehandSketch>
              <MapboxGL.RasterLayer id={'sketchLayer'}/>
            </FreehandSketch>
          )}

        {/* Colored Halo Around Points Layer */}
        <MapboxGL.ShapeSource
          id={'shapeSource'}
          shape={turf.featureCollection(addSymbology(props.spotsNotSelected))}
        >
          <MapboxGL.CircleLayer
            id={'pointLayerColorHalo'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointColorHalo}
          />
        </MapboxGL.ShapeSource>

        {/* Feature Layer */}
        <MapboxGL.Images
          images={symbols}
          onImageMissing={imageKey => {
            setSymbol({...symbols, [imageKey]: symbols.default_point});
          }}
        />
        <MapboxGL.ShapeSource
          id={'spotsNotSelectedSource'}
          shape={turf.featureCollection(addSymbology(useMaps.getSpotsAsFeatures(props.spotsNotSelected)))}
        >
          <MapboxGL.FillLayer
            id={'polygonLayerNotSelected'}
            minZoomLevel={1}
            filter={['all', ['==', ['geometry-type'], 'Polygon'], ['!', ['has', 'fillPattern', ['get', 'symbology']]]]}
            style={useMapSymbology.getMapSymbology().polygon}
          />
          <MapboxGL.FillLayer
            id={'polygonLayerWithPatternNotSelected'}
            minZoomLevel={1}
            filter={['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]]}
            style={useMapSymbology.getMapSymbology().polygonWithPattern}
          />
          <MapboxGL.LineLayer
            id={'polygonLayerNotSelectedBorder'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
            style={useMapSymbology.getMapSymbology().line}
          />

          {/* Need 4 different lines for the different types of line dashes since
           lineDasharray is not suppported with data-driven styling*/}
          <MapboxGL.LineLayer
            id={'lineLayerNotSelected'}
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('solid')}
            style={useMapSymbology.getMapSymbology().line}
          />
          <MapboxGL.LineLayer
            id={'lineLayerNotSelectedDotted'}
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotted')}
            style={useMapSymbology.getMapSymbology().lineDotted}
          />
          <MapboxGL.LineLayer
            id={'lineLayerNotSelectedDashed'}
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dashed')}
            style={useMapSymbology.getMapSymbology().lineDashed}
          />
          <MapboxGL.LineLayer
            id={'lineLayerNotSelectedDotDashed'}
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotDashed')}
            style={useMapSymbology.getMapSymbology().lineDotDashed}
          />

          <MapboxGL.SymbolLayer
            id={'pointLayerNotSelected'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().point}
          />
        </MapboxGL.ShapeSource>

        {/* Selected Features Layer */}
        <MapboxGL.ShapeSource
          id={'spotsSelectedSource'}
          shape={turf.featureCollection(addSymbology(useMaps.getSpotsAsFeatures(props.spotsSelected)))}
        >
          <MapboxGL.FillLayer
            id={'polygonLayerSelected'}
            minZoomLevel={1}
            filter={['all', ['==', ['geometry-type'], 'Polygon'], ['!', ['has', 'fillPattern', ['get', 'symbology']]]]}
            style={useMapSymbology.getMapSymbology().polygonSelected}
          />
          <MapboxGL.FillLayer
            id={'polygonLayerWithPatternSelected'}
            minZoomLevel={1}
            filter={['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]]}
            style={useMapSymbology.getMapSymbology().polygonWithPatternSelected}
          />
          <MapboxGL.LineLayer
            id={'polygonLayerSelectedBorder'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
            style={useMapSymbology.getMapSymbology().line}
          />

          {/* Need 4 different lines for the different types of line dashes since
           lineDasharray is not suppported with data-driven styling*/}
          <MapboxGL.LineLayer
            id={'lineLayerSelected'}
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('solid')}
            style={useMapSymbology.getMapSymbology().lineSelected}
          />
          <MapboxGL.LineLayer
            id={'lineLayerSelectedDotted'}
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotted')}
            style={useMapSymbology.getMapSymbology().lineSelectedDotted}
          />
          <MapboxGL.LineLayer
            id={'lineLayerSelectedDashed'}
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dashed')}
            style={useMapSymbology.getMapSymbology().lineSelectedDashed}
          />
          <MapboxGL.LineLayer
            id={'lineLayerSelectedDotDashed'}
            minZoomLevel={1}
            filter={useMapSymbology.getLinesFilteredByPattern('dotDashed')}
            style={useMapSymbology.getMapSymbology().lineSelectedDotDashed}
          />

        </MapboxGL.ShapeSource>

        {/* Halo Around Selected Point Feature Layer */}
        <MapboxGL.ShapeSource
          id={'pointSpotsSelectedSource'}
          shape={turf.featureCollection(addSymbology(props.spotsSelected))}
        >
          <MapboxGL.CircleLayer
            id={'pointLayerSelectedHalo'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointSelected}
          />
        </MapboxGL.ShapeSource>

        {/* Draw Layer */}
        <MapboxGL.ShapeSource
          id={'drawFeatures'}
          shape={turf.featureCollection(props.drawFeatures)}
        >
          <MapboxGL.CircleLayer
            id={'pointLayerDraw'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointDraw}
          />
          <MapboxGL.LineLayer
            id={'lineLayerDraw'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'LineString']}
            style={useMapSymbology.getMapSymbology().lineDraw}
          />
          <MapboxGL.FillLayer
            id={'polygonLayerDraw'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
            style={useMapSymbology.getMapSymbology().polygonDraw}
          />
        </MapboxGL.ShapeSource>

        {/* Edit Layer */}
        <MapboxGL.ShapeSource
          id={'editFeatureVertex'}
          shape={turf.featureCollection(props.editFeatureVertex)}
        >
          <MapboxGL.CircleLayer
            id={'pointLayerEdit'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointEdit}
          />
        </MapboxGL.ShapeSource>

        {/* Strat Section X Lines Layer for Covered/Uncovered or Not Measured Intervals */}
        {props.stratSection && (
          <CoveredIntervalsXLines spotsDisplayed={[...props.spotsNotSelected, ...props.spotsSelected]}/>
        )}

        {/* Measure Layer */}
        <MapboxGL.ShapeSource
          id={'mapMeasure'}
          shape={turf.featureCollection(props.measureFeatures)}
        >
          <MapboxGL.CircleLayer
            id={'measureLayerPoints'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointMeasure}
          />
          <MapboxGL.LineLayer
            id={'measureLayerLines'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'LineString']}
            style={useMapSymbology.getMapSymbology().lineMeasure}
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
