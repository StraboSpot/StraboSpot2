import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import ScaleBarAndZoom from '../../shared/ui/Scalebar';
import homeStyles from '../home/home.style';
import useImagesHook from '../images/useImages';
import FreehandSketch from '../sketch/FreehandSketch';
import {BACKGROUND, MAPBOX_TOKEN} from './maps.constants';
import {setViewStateGeo, setViewStateImageBasemap, setViewStateStratSection} from './maps.slice';
import CoveredIntervalsXLines from './strat-section/CoveredIntervalsXLines';
import {STRAT_PATTERNS} from './strat-section/stratSection.constants';
import StratSectionBackground from './strat-section/StratSectionBackground';
import {MAP_SYMBOLS} from './symbology/mapSymbology.constants';
import useMapSymbologyHook from './symbology/useMapSymbology';
import useMapsHook from './useMaps';

MapboxGL.setWellKnownTileServer('mapbox');
MapboxGL.setAccessToken(MAPBOX_TOKEN);

const Basemap = (props) => {
  console.log('Rendering Basemap...');
  // console.log('Basemap props:', props);

  const dispatch = useDispatch();

  const customMaps = useSelector(state => state.map.customMaps);
  const viewStateGeo = useSelector(state => state.map.viewStateGeo);
  const viewStateImageBasemap = useSelector(state => state.map.viewStateImageBasemap);
  const viewStateStratSection = useSelector(state => state.map.viewStateStratSection);

  const {mapRef, cameraRef} = props.forwardedRef;
  const [useMapSymbology] = useMapSymbologyHook();
  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook(mapRef);

  const [doesImageExist, setDoesImageExist] = useState(false);
  const [isStratStyleLoaded, setIsStratStyleLoaded] = useState(false);
  const [symbols, setSymbol] = useState({...MAP_SYMBOLS, ...STRAT_PATTERNS});

  const viewState = props.imageBasemap ? viewStateImageBasemap
    : props.stratSection ? viewStateStratSection
      : viewStateGeo;
  console.log('Got view state', viewState);

  const [zoomText, setZoomText] = useState(viewState.zoom);

  const coordQuad = useMaps.getCoordQuad(props.imageBasemap);

  useEffect(() => {
    console.log('UE Basemap [props.imageBasemap]', props.imageBasemap);
    if (props.imageBasemap && props.imageBasemap.id) checkImageExistance().catch(console.error);
  }, [props.imageBasemap]);

  const checkImageExistance = async () => {
    return useImages.doesImageExistOnDevice(props.imageBasemap.id).then(doesExist => setDoesImageExist(doesExist));
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

  // Update spots in extent and save view (center and zoom)
  const onMapIdle = ({properties, timestamp}) => {
    const timeAgo = Math.round(new Date().getTime() - timestamp);
    console.log('Event onMapIdle from', timeAgo, 'ms ago', properties);
    const newViewState = {
      longitude: properties?.center?.[0],
      latitude: properties?.center?.[1],
      ...properties,
      zoom: properties.zoom,
    };
    // console.log('Previous View State:', viewState.longitude, viewState.latitude, viewState.zoom);
    // console.log('New View State:', newViewState.longitude, newViewState.latitude, newViewState.zoom);

    if (timeAgo < 200 && (viewState.longitude !== newViewState.longitude || viewState.latitude !== newViewState.latitude
      || viewState.zoom !== newViewState.zoom)) {
      console.log('Setting new view state...', newViewState);
      if (props.imageBasemap) dispatch(setViewStateImageBasemap(newViewState));
      else if (props.stratSection) dispatch(setViewStateStratSection(newViewState));
      else dispatch(setViewStateGeo(newViewState));
      props.spotsInMapExtent();
    }
  };

  // Update scale bar and zoom text
  const onCameraChanged = async ({properties, timestamp}) => {
    console.log('Event onCameraChanged', properties);
    setZoomText(properties.zoom);
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
          <ScaleBarAndZoom basemap={props.basemap} latitude={viewState.latitude} zoom={zoomText}/>
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
        scaleBarEnabled={false}
      >

        {/* Blue dot for user location */}
        <MapboxGL.UserLocation
          animated={false}
          visible={!props.imageBasemap && !props.stratSection && props.showUserLocation}
        />

        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={viewState.zoom}
          centerCoordinate={[viewState.longitude, viewState.latitude]}
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
