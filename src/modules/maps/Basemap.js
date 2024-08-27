import React, {forwardRef, useEffect, useRef, useState} from 'react';
import {Text, View} from 'react-native';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import {useDispatch, useSelector} from 'react-redux';

import {BACKGROUND, MAP_MODES, MAPBOX_TOKEN} from './maps.constants';
import {setIsMapMoved} from './maps.slice';
import CoveredIntervalsXLines from './strat-section/CoveredIntervalsXLines';
import {STRAT_PATTERNS} from './strat-section/stratSection.constants';
import StratSectionBackground from './strat-section/StratSectionBackground';
import {MAP_SYMBOLS} from './symbology/mapSymbology.constants';
import useMapSymbologyHook from './symbology/useMapSymbology';
import useMapCoordsHook from './useMapCoords';
import useMapFeaturesHook from './useMapFeatures';
import useMapURLHook from './useMapURL';
import useMapViewHook from './useMapView';
import VertexDrag from './VertexDrag';
import {isEmpty} from '../../shared/Helpers';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import homeStyles from '../home/home.style';
import useImagesHook from '../images/useImages';
import FreehandSketch from '../sketch/FreehandSketch';

MapboxGL.setAccessToken(MAPBOX_TOKEN);

const Basemap = ({
                   allowMapViewMove,
                   basemap,
                   drawFeatures,
                   editFeatureVertex,
                   mapMode,
                   measureFeatures,
                   onMapLongPress,
                   onMapPress,
                   showUserLocation,
                   spotsNotSelected,
                   spotsSelected,
                 }, forwardedRef) => {
  // console.log('Rendering Basemap...');
  const zoomTextStyle = basemap.id === 'mapbox.satellite' ? homeStyles.currentZoomTextWhite
    : homeStyles.currentZoomTextBlack;

  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const customMaps = useSelector(state => state.map.customMaps);
  const isMapMoved = useSelector(state => state.map.isMapMoved);
  const stratSection = useSelector(state => state.map.stratSection);
  const vertexStartCoords = useSelector(state => state.map.vertexStartCoords);

  const {mapRef, cameraRef} = forwardedRef;

  const useImages = useImagesHook();
  const useMapCoords = useMapCoordsHook();
  const useMapFeatures = useMapFeaturesHook();
  const useMapSymbology = useMapSymbologyHook();
  const useMapURL = useMapURLHook();
  const useMapView = useMapViewHook();

  const [doesImageExist, setDoesImageExist] = useState(false);
  const [initialCenter, setInitialCenter] = useState();
  const [initialZoom, setInitialZoom] = useState();
  const [isStratStyleLoaded, setIsStratStyleLoaded] = useState(false);
  const [symbols, setSymbol] = useState({...MAP_SYMBOLS, ...STRAT_PATTERNS});
  const [zoomText, setZoomText] = useState();

  const cameraChangedTimestampRef = useRef(0);

  const coordQuad = useMapCoords.getCoordQuad(currentImageBasemap);

  // Get selected and not selected Spots as features, split into multiple features if multiple orientations
  const featuresNotSelected = turf.featureCollection(
    useMapFeatures.getSpotsAsFeatures(useMapSymbology.addSymbology(spotsNotSelected)));
  const featuresSelected = turf.featureCollection(
    useMapFeatures.getSpotsAsFeatures(useMapSymbology.addSymbology(spotsSelected)));

  // Get only 1 selected and not selected feature per id for colored halos so multiple halos aren't stacked
  const featuresNotSelectedUniq = turf.featureCollection(
    featuresNotSelected.features?.reduce((acc, f) =>
      acc.map(f1 => f1.properties.id).includes(f.properties.id) ? acc : [...acc, f], []));
  const featuresSelectedUniq = turf.featureCollection(
    featuresSelected.features?.reduce((acc, f) =>
      acc.map(f1 => f1.properties.id).includes(f.properties.id) ? acc : [...acc, f], []));

  useEffect(() => {
      // console.log('UE Basemap');
    if (!isMapMoved) dispatch(setIsMapMoved(true));
    const {longitude, latitude, zoom} = useMapView.getInitialViewState();
      console.log('Got initial center [' + longitude + ', ' + latitude + '] and zoom', zoom);
      setInitialCenter([longitude, latitude]);
      setInitialZoom(zoom);
    }, [currentImageBasemap, stratSection],
  );

  useEffect(() => {
    // console.log('UE Basemap [currentImageBasemap]', currentImageBasemap);
    if (currentImageBasemap && currentImageBasemap.id) checkImageExistence().catch(console.error);
  }, [currentImageBasemap]);

  const checkImageExistence = async () => {
    return useImages.doesImageExistOnDevice(currentImageBasemap.id).then(doesExist => setDoesImageExist(doesExist));
  };

  // Update spots in extent and saved view (center and zoom)
  const onMapMoved = async (e) => {
    // console.log('Event onMapMoved Timestamp difference', e.timestamp - cameraChangedTimestampRef.current);
    if (e.timestamp - cameraChangedTimestampRef.current > 1000) {
      console.log('Map Moved. Updating View...');
      cameraChangedTimestampRef.current = e.timestamp;
      if (!isMapMoved) dispatch(setIsMapMoved(true));
      if (!currentImageBasemap && !stratSection && mapRef?.current) {
        const newCenter = await mapRef.current.getCenter();
        const newZoom = await mapRef.current.getZoom();
        setZoomText(newZoom);   // Update scale bar and zoom text
        useMapView.setMapView(newCenter, newZoom);
      }
    }
  };

  // Set flag for when the map has been loaded
  // This is a fix for patterns loading too slowly after v10 update
  // ToDo: Check if this bug is fixed in rnmapbox and therefore can be removed
  const onDidFinishLoadingMap = () => {
    stratSection ? setIsStratStyleLoaded(true) : setIsStratStyleLoaded(false);
  };

  const scaleBarPosition = () => {
    return SMALL_SCREEN ? {top: 20, left: 70} : {bottom: 20, left: 80};
  };

  return (
    <>
      {!stratSection && !currentImageBasemap && zoomText && (
        <View
          style={SMALL_SCREEN ? homeStyles.zoomAndScaleBarContainerSmallScreen : homeStyles.zoomAndScaleBarContainer}
        >
          <Text style={zoomTextStyle}>Zoom: </Text>
          <Text style={zoomTextStyle}>{zoomText.toFixed(1)}</Text>
        </View>
      )}
      <MapboxGL.MapView
        id={currentImageBasemap ? currentImageBasemap.id : stratSection ? stratSection.strat_section_id
          : basemap.id}
        ref={mapRef}
        style={{flex: 1}}
        styleURL={currentImageBasemap || stratSection ? JSON.stringify(BACKGROUND)
          : JSON.stringify(basemap)}
        animated={true}
        localizeLabels={true}
        logoEnabled={true}
        logoPosition={homeStyles.mapboxLogoPosition}
        rotateEnabled={false}
        pitchEnabled={false}
        attributionEnabled={true}
        attributionPosition={homeStyles.mapboxAttributionPosition}
        onPress={onMapPress}
        onLongPress={onMapLongPress}
        scrollEnabled={allowMapViewMove}
        zoomEnabled={allowMapViewMove}
        onCameraChanged={onMapMoved}  // Update spots in extent and saved view (center and zoom)
        onDidFinishLoadingMap={onDidFinishLoadingMap}
        scaleBarEnabled={!currentImageBasemap && !stratSection}
        scaleBarPosition={scaleBarPosition()}
      >

        {/* Blue dot for user location */}
        <MapboxGL.UserLocation
          animated={false}
          visible={!currentImageBasemap && !stratSection && showUserLocation}
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
        {!currentImageBasemap && !stratSection && Object.values(customMaps).map((customMap) => {
          return (
            customMap.overlay && (
              <MapboxGL.RasterSource
                key={customMap.id}
                id={customMap.id}
                tileUrlTemplates={[useMapURL.buildTileURL(customMap)]}
              >
                <MapboxGL.RasterLayer
                  aboveLayerID={basemap.id}
                  id={customMap.id + 'Layer'}
                  sourceID={customMap.id}
                  style={{
                    rasterOpacity: customMap.opacity && parseFloat(customMap.opacity.toString())
                    && parseFloat(customMap.opacity.toString()) >= 0 && parseFloat(customMap.opacity.toString()) <= 1
                      ? parseFloat(customMap.opacity.toString()) : 1,
                    visibility: customMap.isViewable ? 'visible' : 'none',
                  }}
                />
              </MapboxGL.RasterSource>
            )
          );
        })}

        {/* Strat Section background Layer */}
        {stratSection && (
          <StratSectionBackground spotsDisplayed={[...spotsNotSelected, ...spotsSelected]}/>
        )}

        {/* Image Basemap Layer */}
        {currentImageBasemap && !isEmpty(coordQuad) && doesImageExist && (
          <MapboxGL.ImageSource
            id={'currentImageBasemap'}
            coordinates={coordQuad}
            url={useImages.getLocalImageURI(currentImageBasemap.id)}>
            <MapboxGL.RasterLayer
              id={'imageBasemapLayer'}
              style={{rasterOpacity: 1}}
              aboveLayerID={'background'}
            />
          </MapboxGL.ImageSource>
        )}

        {/* Sketch Layer */}
        {(mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON || mapMode === MAP_MODES.DRAW.FREEHANDLINE)
          && (
            <FreehandSketch>
              <MapboxGL.RasterLayer id={'sketchLayer'}/>
            </FreehandSketch>
          )}

        {/* Halo Around Selected Point Feature Layer */}
        <MapboxGL.ShapeSource
          id={'pointSpotsSelectedSource'}
          shape={featuresSelectedUniq}
        >
          <MapboxGL.CircleLayer
            id={'pointLayerSelectedHalo'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointSelected}
          />
        </MapboxGL.ShapeSource>

        {/* Colored Halo Around Points Layer */}
        <MapboxGL.ShapeSource
          id={'pointSourceColorHalo'}
          shape={featuresNotSelectedUniq}
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
          shape={featuresNotSelected}
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
              visibility: stratSection && isStratStyleLoaded ? 'visible' : 'none',
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
          shape={featuresSelected}
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
              visibility: stratSection && isStratStyleLoaded ? 'visible' : 'none',
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

        {/* Draw Layer */}
        <MapboxGL.ShapeSource
          id={'drawFeatures'}
          shape={turf.featureCollection(drawFeatures)}
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
          shape={turf.featureCollection(editFeatureVertex)}
        >
          <MapboxGL.CircleLayer
            id={'pointLayerEdit'}
            minZoomLevel={1}
            filter={['==', ['geometry-type'], 'Point']}
            style={useMapSymbology.getMapSymbology().pointEdit}
          />
        </MapboxGL.ShapeSource>

        {/* Strat Section X Lines Layer for Covered/Uncovered or Not Measured Intervals */}
        {stratSection && (
          <CoveredIntervalsXLines spotsDisplayed={[...spotsNotSelected, ...spotsSelected]}/>
        )}

        {/* Measure Layer */}
        <MapboxGL.ShapeSource
          id={'mapMeasure'}
          shape={turf.featureCollection(measureFeatures)}
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
      {vertexStartCoords && <VertexDrag/>}
    </>
  );
};

export default forwardRef(Basemap);
