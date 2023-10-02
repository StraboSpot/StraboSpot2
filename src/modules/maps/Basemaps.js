import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import proj4 from 'proj4';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import homeStyles from '../home/home.style';
import useImagesHook from '../images/useImages';
import FreehandSketch from '../sketch/FreehandSketch';
import {
  BACKGROUND,
  GEO_LAT_LNG_PROJECTION,
  LATITUDE,
  LONGITUDE,
  MAPBOX_TOKEN,
  PIXEL_PROJECTION,
  STRAT_SECTION_CENTER,
  ZOOM,
  ZOOM_STRAT_SECTION,
} from './maps.constants';
import CoveredIntervalsXLines from './strat-section/CoveredIntervalsXLines';
import {STRAT_PATTERNS} from './strat-section/stratSection.constants';
import StratSectionBackground from './strat-section/StratSectionBackground';
import {MAP_SYMBOLS} from './symbology/mapSymbology.constants';
import useMapSymbologyHook from './symbology/useMapSymbology';
import useMapsHook from './useMaps';
import useMapViewHook from './useMapView';

MapboxGL.setWellKnownTileServer('mapbox');
MapboxGL.setAccessToken(MAPBOX_TOKEN);

const Basemap = (props) => {
  console.log('Rendering Basemap...');
  const zoomTextStyle = props.basemap.id === 'mapbox.satellite' ? homeStyles.currentZoomTextWhite
    : homeStyles.currentZoomTextBlack;
  // console.log('Basemap props:', props);

  const center = useSelector(state => state.map.center) || [LONGITUDE, LATITUDE];
  const customMaps = useSelector(state => state.map.customMaps);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const zoom = useSelector(state => state.map.zoom) || ZOOM;

  const {mapRef, cameraRef} = props.forwardedRef;

  const [useImages] = useImagesHook();
  const [useMapSymbology] = useMapSymbologyHook();
  const [useMaps] = useMapsHook();
  const useMapView = useMapViewHook();

  const [doesImageExist, setDoesImageExist] = useState(false);
  const [isStratStyleLoaded, setIsStratStyleLoaded] = useState(false);
  const [symbols, setSymbol] = useState({...MAP_SYMBOLS, ...STRAT_PATTERNS});
  const [zoomText, setZoomText] = useState(zoom);

  const [initialCenter, setInitialCenter] = useState(center);
  const [initialZoom, setInitialZoom] = useState(zoom);

  const coordQuad = useMaps.getCoordQuad(props.imageBasemap);

  useEffect(() => {
      console.log('UE Basemap');
      setInitialCenter(getCenterCoordinates());
      setInitialZoom(getZoomLevel());
    }, [props.imageBasemap, props.stratSection],
  );

  useEffect(() => {
    console.log('UE Basemap [props.imageBasemap]', props.imageBasemap);
    if (props.imageBasemap && props.imageBasemap.id) checkImageExistance().catch(console.error);
  }, [props.imageBasemap]);

  const checkImageExistance = async () => {
    return useImages.doesImageExistOnDevice(props.imageBasemap.id).then(doesExist => setDoesImageExist(doesExist));
  };

  // Evaluate and return appropriate center coordinates
  const getCenterCoordinates = () => {
    console.log('Getting initial map center...');
    if (props.zoomToSpot && !isEmpty(selectedSpot)) {
      if ((props.imageBasemap && selectedSpot.properties.image_basemap === props.imageBasemap.id)
        || (props.stratSection && selectedSpot.properties.strat_section_id === props.stratSection.strat_section_id)) {
        return proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION, turf.centroid(selectedSpot).geometry.coordinates);
      }
      else if (!selectedSpot.properties.image_basemap && !selectedSpot.properties.strat_section_id) {
        return turf.centroid(selectedSpot).geometry.coordinates;
      }
    }
    else if (props.imageBasemap) {
      return proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION,
        [(props.imageBasemap.width) / 2, (props.imageBasemap.height) / 2]);
    }
    else if (props.stratSection) return STRAT_SECTION_CENTER;
    return center;
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

  const getZoomLevel = () => {
    console.log('Getting initial zoom...');
    if (props.imageBasemap) return ZOOM;
    else if (props.stratSection) return ZOOM_STRAT_SECTION;
    return zoom;
  };

  // Update spots in extent and saved view (center and zoom)
  const onMapIdle = async (e) => {
    // console.log('Event onMapIdle', e);
    await props.updateSpotsInMapExtent();
    if (!props.imageBasemap && !props.stratSection && mapRef?.current) {
      const newCenter = await mapRef.current.getCenter();
      const newZoom = await mapRef.current.getZoom();
      useMapView.setMapView(newCenter, newZoom);
    }
  };

  // Update scale bar and zoom text
  const onCameraChanged = async (e) => {
    console.log('Event onCameraChanged', e);
    if (!props.imageBasemap && !props.stratSection && mapRef?.current) {
      const newZoom = await mapRef.current.getZoom();
      setZoomText(newZoom);
    }
  };

  // Set flag for when the map has been loaded
  // This is a fix for patterns loading too slowly after v10 update
  // ToDo: Check if this bug is fixed in rnmapbox and therefore can be removed
  const onDidFinishLoadingMap = () => {
    props.stratSection ? setIsStratStyleLoaded(true) : setIsStratStyleLoaded(false);
  };

  return (
    <View style={{flex: 1}}>
      {!props.stratSection && !props.imageBasemap && (
        <View style={homeStyles.zoomAndScaleBarContainer}>
          <Text style={zoomTextStyle}>Zoom:</Text>
          <Text style={zoomTextStyle}>{zoomText.toFixed(1)}</Text>
        </View>
      )}
      <MapboxGL.MapView
        id={props.imageBasemap ? props.imageBasemap.id : props.stratSection ? props.stratSection.strat_section_id
          : props.basemap.id}
        ref={mapRef}
        style={{flex: 1}}
        styleURL={props.imageBasemap || props.stratSection ? JSON.stringify(BACKGROUND)
          : JSON.stringify(props.basemap)}
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
        onMapIdle={onMapIdle}    // Update spots in extent and saved view (center and zoom)
        onCameraChanged={onCameraChanged}  // Update scale bar and zoom text
        onDidFinishLoadingMap={onDidFinishLoadingMap}
        scaleBarEnabled={!props.imageBasemap && !props.stratSection}
        scaleBarPosition={{bottom: 20, left: 80}}
      >

        {/* Blue dot for user location */}
        <MapboxGL.UserLocation
          animated={false}
          visible={!props.imageBasemap && !props.stratSection && props.showUserLocation}
        />

        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={initialZoom}
          centerCoordinate={initialCenter}
          animationDuration={0}
          // followUserLocation={true}   // Can't follow user location if wanting to zoom to extent of Spots
          // followUserMode='normal'
        />

        {/* Custom Overlay Layer */}
        {Object.values(customMaps).map((customMap) => {
          return (
            customMap.overlay && (
              <MapboxGL.RasterSource
                key={customMap.id}
                id={customMap.id}
                tileUrlTemplates={[useMaps.buildTileUrl(customMap)]}
              >
                <MapboxGL.RasterLayer
                  id={customMap.id + 'Layer'}
                  sourceID={customMap.id}
                  style={{
                    rasterOpacity: customMap.opacity && typeof (customMap.opacity) === 'number'
                    && customMap.opacity >= 0 && customMap.opacity <= 1 ? customMap.opacity : 1,
                    visibility: customMap.isViewable ? 'visible' : 'none',
                  }}
                />
              </MapboxGL.RasterSource>
            )
          );
        })}

        {/* Strat Section background Layer */}
        {props.stratSection && (
          <StratSectionBackground maxXY={getStratIntervalsMaxXY()} stratSection={props.stratSection}/>
        )}

        {/* Image Basemap Layer */}
        {props.imageBasemap && !isEmpty(coordQuad) && doesImageExist && (
          <MapboxGL.ImageSource
            id={'imageBasemap'}
            coordinates={coordQuad}
            url={useImages.getLocalImageURI(props.imageBasemap.id)}>
            <MapboxGL.RasterLayer
              id={'imageBasemapLayer'}
              style={{rasterOpacity: 1}}
              belowLayerID={'pointLayerColorHalo'}
            />
          </MapboxGL.ImageSource>
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
          id={'pointSourceColorHalo'}
          shape={turf.featureCollection(useMapSymbology.addSymbology(props.spotsNotSelected))}
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
          onImageMissing={(imageKey) => {
            setSymbol({...symbols, [imageKey]: symbols.default_point});
          }}
        />
        <MapboxGL.ShapeSource
          id={'spotsNotSelectedSource'}
          shape={turf.featureCollection(
            useMapSymbology.addSymbology(useMaps.getSpotsAsFeatures(props.spotsNotSelected)))}
        >
          {/* Polygon Not Selected */}
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
            style={{
              ...useMapSymbology.getMapSymbology().polygonWithPattern,
              visibility: props.stratSection && isStratStyleLoaded ? 'visible' : 'none',
            }}
          />
          <MapboxGL.LineLayer
            id={'polygonLayerNotSelectedBorder'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
            style={useMapSymbology.getMapSymbology().line}
          />
          <MapboxGL.SymbolLayer
            id={'polygonLabelLayerNotSelected'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
            style={useMapSymbology.getMapSymbology().polygonLabel}
          />

          {/* Line Not Selected */}
          {/* Need 4 different lines for the different types of line dashes since
           lineDasharray is not supported with data-driven styling*/}
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
            id={'lineLabelLayerNotSelected'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'LineString']}
            style={useMapSymbology.getMapSymbology().lineLabel}
          />

          {/* Point Not Selected */}
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
          shape={turf.featureCollection(useMapSymbology.addSymbology(useMaps.getSpotsAsFeatures(props.spotsSelected)))}
        >
          {/* Polygon Selected */}
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
            style={{
              ...useMapSymbology.getMapSymbology().polygonWithPatternSelected,
              visibility: props.stratSection && isStratStyleLoaded ? 'visible' : 'none',
            }}
          />
          <MapboxGL.LineLayer
            id={'polygonLayerSelectedBorder'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
            style={useMapSymbology.getMapSymbology().line}
          />
          <MapboxGL.SymbolLayer
            id={'polygonLabelLayerSelected'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Polygon']}
            style={useMapSymbology.getMapSymbology().polygonLabel}
          />

          {/* Line Selected */}
          {/* Need 4 different lines for the different types of line dashes since
           lineDasharray is not supported with data-driven styling*/}
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
          <MapboxGL.SymbolLayer
            id={'lineLabelLayerSelected'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'LineString']}
            style={useMapSymbology.getMapSymbology().lineLabel}
          />

        </MapboxGL.ShapeSource>

        {/* Halo Around Selected Point Feature Layer */}
        <MapboxGL.ShapeSource
          id={'pointSpotsSelectedSource'}
          shape={turf.featureCollection(useMapSymbology.addSymbology(props.spotsSelected))}
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
};

export const MapLayer = React.forwardRef((props, ref) => (
  <Basemap {...props} forwardedRef={ref}/>
));
MapLayer.displayName = 'MapLayer';
