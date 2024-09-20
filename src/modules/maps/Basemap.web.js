import React, {forwardRef, useEffect, useRef, useState} from 'react';
import {Platform, useWindowDimensions, View} from 'react-native';

import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import {Layer, Map, ScaleControl, Source} from 'react-map-gl';
import {useDispatch, useSelector} from 'react-redux';

import {BACKGROUND, MAP_MODES, MAPBOX_TOKEN, ZOOM_STRAT_SECTION} from './maps.constants';
import {setIsMapMoved, setVertexEndCoords} from './maps.slice';
import CoveredIntervalsXLines from './strat-section/CoveredIntervalsXLines';
import {STRAT_PATTERNS} from './strat-section/stratSection.constants';
import StratSectionBackground from './strat-section/StratSectionBackground';
import {MAP_SYMBOLS} from './symbology/mapSymbology.constants';
import useMapSymbologyHook from './symbology/useMapSymbology';
import useMap from './useMap';
import useMapCoordsHook from './useMapCoords';
import useMapFeaturesHook from './useMapFeatures';
import useMapURLHook from './useMapURL';
import useMapViewHook from './useMapView';
import {isEmpty} from '../../shared/Helpers';
import {useImages} from '../images';

const Basemap = ({
                   allowMapViewMove,
                   basemap,
                   drawFeatures,
                   editFeatureVertex,
                   mapMode,
                   measureFeatures,
                   onMapLongPress,
                   onMapPress,
                   spotsNotSelected,
                   spotsSelected,
                 }, forwardedRef) => {
  // console.log('Rendering Basemap...');

  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const customMaps = useSelector(state => state.map.customMaps);
  const isMapMoved = useSelector(state => state.map.isMapMoved);
  const stratSection = useSelector(state => state.map.stratSection);

  const {mapRef} = forwardedRef;

  const useDimensions = useWindowDimensions();
  const {getImageScreenSizedURI, getLocalImageURI} = useImages();
  const {isDrawMode} = useMap();
  const useMapCoords = useMapCoordsHook();
  const useMapFeatures = useMapFeaturesHook();
  const useMapSymbology = useMapSymbologyHook();
  const useMapURL = useMapURLHook();
  const useMapView = useMapViewHook();

  const [cursor, setCursor] = useState('');
  const [prevMapMode, setPrevMapMode] = useState(mapMode);
  const [viewState, setViewState] = React.useState({});

  const pointMoving = useRef(null);

  const layerIdsNotSelected = ['polygonLayerNotSelected', 'polygonLayerWithPatternNotSelected',
    'polygonLayerNotSelectedBorder', 'polygonLabelLayerNotSelected', 'lineLayerNotSelected',
    'lineLayerNotSelectedDotted', 'lineLayerNotSelectedDashed', 'lineLayerNotSelectedDotDashed',
    'lineLabelLayerNotSelected', 'pointLayerNotSelected'];
  const layerIdsSelected = ['polygonLayerSelected', 'polygonLayerWithPatternSelected',
    'polygonLayerSelectedBorder', 'polygonLabelLayerSelected', 'lineLayerSelected', 'lineLayerSelectedDotted',
    'lineLayerSelectedDashed', 'lineLayerSelectedDotDashed', 'lineLabelLayerSelected', 'pointLayerSelectedHalo'];
  const symbols = {...MAP_SYMBOLS, ...STRAT_PATTERNS};

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
      // console.log('UE Basemap', viewState);
      // console.log('Dimensions', useDimensions);
      if (!isMapMoved) dispatch(setIsMapMoved(true));
      setViewState(useMapView.getInitialViewState());
    }, [currentImageBasemap, stratSection],
  );

  if (mapMode !== prevMapMode) {
    // console.log('MapMode changed from', prevMapMode, 'to', mapMode);
    setPrevMapMode(mapMode);
    if (isDrawMode(mapMode) || mapMode === MAP_MODES.EDIT) setCursor('pointer');
    else setCursor('');
  }

  // Add the image to the map style.
  mapRef.current?.on('styleimagemissing', (e) => {
    const id = e.id;  // id of the missing image
    if (!mapRef.current?.hasImage(id)) {
      mapRef.current?.loadImage(
        symbols[id],
        (error, image) => {
          if (error) throw error;
          if (!mapRef.current?.hasImage(id)) {
            mapRef.current?.addImage(id, image);
            if (mapRef.current?.hasImage(id)) console.log('Added Image:', id);
          }
        },
      );
    }
  });

  // Update spots in extent and saved view (center and zoom)
  const onMapMoved = (e) => {
    // console.log('Event onMapMoved', e);
    if (!isMapMoved) dispatch(setIsMapMoved(true));
    if (currentImageBasemap || stratSection) {
      // TODO Next line is a hack to fix image basemaps and strat section zooming issue on fresh load
      const newZoom = e.viewState.zoom < 1 ? ZOOM_STRAT_SECTION : e.viewState.zoom;
      setViewState({...e.viewState, zoom: newZoom});
    }
    else {
      console.log('evt.viewState', e.viewState);
      setViewState(e.viewState);
      const newCenter = [e.viewState.longitude, e.viewState.latitude];
      const newZoom = e.viewState.zoom;
      useMapView.setMapView(newCenter, newZoom);
    }
  };

  const onMouseEnter = () => {
    if (mapMode === MAP_MODES.VIEW || mapMode === MAP_MODES.EDIT) setCursor('pointer');
  };

  const onMouseLeave = () => {
    if (mapMode === MAP_MODES.VIEW) setCursor('');
    else if (isDrawMode(mapMode)) setCursor('pointer');
    else if (mapMode === MAP_MODES.EDIT) setCursor('default');
  };

  const onPointMove = (e) => {
    setCursor('grabbing'); // Set a UI indicator for dragging

    // Update the Point feature and call setData to the update source edit layer
    const coords = e.lngLat;
    pointMoving.current = [{
      ...pointMoving.current[0],
      geometry: {...pointMoving.current[0].geometry, coordinates: [coords.lng, coords.lat]},
    }];
    mapRef.current?.getSource('editFeatureVertex').setData(turf.featureCollection(pointMoving.current));
  };

  const onUp = (e) => {
    setCursor('');

    // Unbind mouse/touch events
    mapRef.current?.off('mousemove', onPointMove);
    mapRef.current?.off('touchmove', onPointMove);

    const coords = e.lngLat;
    const vertexScreenCoords = mapRef.current.project([coords.lng, coords.lat]);
    dispatch(setVertexEndCoords([vertexScreenCoords.x, vertexScreenCoords.y]));
  };

  //When the cursor enters a feature in the point edit layer, prepare for dragging.
  mapRef.current?.on('mouseenter', 'pointLayerEdit', () => {
    setCursor('move');
  });

  mapRef.current?.on('mouseleave', 'pointLayerEdit', () => {
    setCursor('default');
  });

  mapRef.current?.on('mousedown', 'pointLayerEdit', (e) => {
    pointMoving.current = editFeatureVertex;
    if (isEmpty(e.point)) return;
    setCursor('grab');
    mapRef.current?.on('mousemove', onPointMove);
    mapRef.current?.once('mouseup', onUp);
  });

  return (
    <Map
      {...viewState}
      id={currentImageBasemap ? currentImageBasemap.id : stratSection ? stratSection.strat_section_id
        : basemap.id}
      ref={mapRef}
      style={{flex: 1}}
      mapStyle={currentImageBasemap || stratSection ? BACKGROUND : basemap}
      boxZoom={allowMapViewMove}
      dragRotate={false}
      dragPan={allowMapViewMove}
      pitchWithRotate={false}
      touchPitch={false}
      touchZoomRotate={false}
      doubleClickZoom={!(isDrawMode(mapMode) || mapMode === MAP_MODES.EDIT)}
      onClick={onMapPress}
      onDblClick={onMapLongPress}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMoveEnd={onMapMoved}   // Update spots in extent and saved view (center and zoom)
      mapboxAccessToken={MAPBOX_TOKEN}
      cursor={cursor}
      interactiveLayerIds={[...layerIdsNotSelected, ...layerIdsSelected]}
      styleDiffing={false}
    >

      {!stratSection && !currentImageBasemap && (
        <View>
          <ScaleControl
            maxWidth={useDimensions.width * 0.25}
            unit={'imperial'}
            style={{position: 'absolute', left: 50, bottom: 20, background: 'transparent', fontWeight: 'bold'}}
          />
        </View>
      )}

      {/* Custom Overlay Layer */}
      {!currentImageBasemap && !stratSection && Object.values(customMaps).map((customMap) => {
        return (
          customMap.overlay && customMap.isViewable && (
            <Source
              key={customMap.id}
              id={customMap.id}
              type={'raster'}
              tiles={[useMapURL.buildTileURL(customMap)]}
            >
              <Layer
                // beforeId={'pointLayerSelectedHalo'}
                type={'raster'}
                id={customMap.id + 'Layer'}
                paint={{
                  'raster-opacity': customMap.opacity && parseFloat(customMap.opacity.toString())
                  && parseFloat(customMap.opacity.toString()) >= 0 && parseFloat(customMap.opacity.toString()) <= 1
                    ? parseFloat(customMap.opacity.toString()) : 1,
                }}
              />
            </Source>
          )
        );
      })}

      {/* Strat Section background Layer */}
      {stratSection && (
        <StratSectionBackground spotsDisplayed={[...spotsNotSelected, ...spotsSelected]}/>
      )}

      {/* Image Basemap Layer */}
      {currentImageBasemap && !isEmpty(coordQuad) && (
        <Source
          id={'currentImageBasemap'}
          type={'image'}
          coordinates={coordQuad}
          url={Platform.OS === 'web' ? getImageScreenSizedURI(currentImageBasemap.id)
            : getLocalImageURI(currentImageBasemap.id)}
        >
          <Layer
            type={'raster'}
            id={'imageBasemapLayer'}
            paint={{'raster-opacity': 1}}
            // beforeId={'pointLayerColorHalo'}
          />
        </Source>
      )}

      {/* Halo Around Selected Point Feature Layer */}
      <Source
        id={'pointSpotsSelectedSource'}
        type={'geojson'}
        data={featuresSelectedUniq}
      >
        <Layer
          type={'circle'}
          id={'pointLayerSelectedHalo'}
          filter={['==', ['geometry-type'], 'Point']}
          paint={useMapSymbology.getPaintSymbology().pointSelected}
        />
      </Source>

      {/* Colored Halo Around Points Layer */}
      <Source
        id={'pointSourceColorHalo'}
        type={'geojson'}
        data={featuresNotSelectedUniq}
      >
        <Layer
          type={'circle'}
          id={'pointLayerColorHalo'}
          filter={['==', ['geometry-type'], 'Point']}
          paint={useMapSymbology.getPaintSymbology().pointColorHalo}
        />
      </Source>

      {/* Feature Layer */}
      <Source
        id={'spotsNotSelectedSource'}
        type={'geojson'}
        data={featuresNotSelected}
      >
        {/* Polygon Not Selected */}
        <Layer
          type={'fill'}
          id={'polygonLayerNotSelected'}
          filter={['all', ['==', ['geometry-type'], 'Polygon'], ['!', ['has', 'fillPattern', ['get', 'symbology']]]]}
          paint={useMapSymbology.getPaintSymbology().polygon}
        />
        <Layer
          type={'fill'}
          id={'polygonLayerWithPatternNotSelected'}
          filter={['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]]}
          paint={useMapSymbology.getPaintSymbology().polygonWithPattern}
        />
        <Layer
          type={'line'}
          id={'polygonLayerNotSelectedBorder'}
          filter={['==', ['geometry-type'], 'Polygon']}
          paint={useMapSymbology.getPaintSymbology().line}
        />
        <Layer
          type={'symbol'}
          id={'polygonLabelLayerNotSelected'}
          filter={['==', ['geometry-type'], 'Polygon']}
          layout={useMapSymbology.getLayoutSymbology().polygonLabel}
        />

        {/* Line Not Selected */}
        {/* Need 4 different lines for the different types of line dashes since
         lineDasharray is not supported with data-driven styling*/}
        <Layer
          type={'line'}
          id={'lineLayerNotSelected'}
          filter={useMapSymbology.getLinesFilteredByPattern('solid')}
          paint={useMapSymbology.getPaintSymbology().line}
        />
        <Layer
          type={'line'}
          id={'lineLayerNotSelectedDotted'}
          filter={useMapSymbology.getLinesFilteredByPattern('dotted')}
          paint={useMapSymbology.getPaintSymbology().lineDotted}
        />
        <Layer
          type={'line'}
          id={'lineLayerNotSelectedDashed'}
          filter={useMapSymbology.getLinesFilteredByPattern('dashed')}
          paint={useMapSymbology.getPaintSymbology().lineDashed}
        />
        <Layer
          type={'line'}
          id={'lineLayerNotSelectedDotDashed'}
          filter={useMapSymbology.getLinesFilteredByPattern('dotDashed')}
          paint={useMapSymbology.getPaintSymbology().lineDotDashed}
        />
        <Layer
          type={'symbol'}
          id={'lineLabelLayerNotSelected'}
          filter={['==', ['geometry-type'], 'LineString']}
          layout={useMapSymbology.getLayoutSymbology().lineLabel}
        />

        {/* Point Not Selected */}
        <Layer
          type={'symbol'}
          id={'pointLayerNotSelected'}
          filter={['==', ['geometry-type'], 'Point']}
          layout={useMapSymbology.getLayoutSymbology().point}
          paint={useMapSymbology.getPaintSymbology().point}
        />
      </Source>

      {/* Selected Features Layer */}
      <Source
        id={'spotsSelectedSource'}
        type={'geojson'}
        data={featuresSelected}
      >
        {/* Polygon Selected */}
        <Layer
          type={'fill'}
          id={'polygonLayerSelected'}
          filter={['all', ['==', ['geometry-type'], 'Polygon'], ['!', ['has', 'fillPattern', ['get', 'symbology']]]]}
          paint={useMapSymbology.getPaintSymbology().polygonSelected}
        />
        <Layer
          type={'fill'}
          id={'polygonLayerWithPatternSelected'}
          filter={['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]]}
          paint={useMapSymbology.getPaintSymbology().polygonWithPatternSelected}
        />
        <Layer
          type={'line'}
          id={'polygonLayerSelectedBorder'}
          filter={['==', ['geometry-type'], 'Polygon']}
          paint={useMapSymbology.getPaintSymbology().line}
        />
        <Layer
          type={'symbol'}
          id={'polygonLabelLayerSelected'}
          filter={['==', ['geometry-type'], 'Polygon']}
          layout={useMapSymbology.getLayoutSymbology().polygonLabel}
        />

        {/* Line Selected */}
        {/* Need 4 different lines for the different types of line dashes since
         lineDasharray is not supported with data-driven styling*/}
        <Layer
          type={'line'}
          id={'lineLayerSelected'}
          filter={useMapSymbology.getLinesFilteredByPattern('solid')}
          paint={useMapSymbology.getPaintSymbology().lineSelected}
        />
        <Layer
          type={'line'}
          id={'lineLayerSelectedDotted'}
          filter={useMapSymbology.getLinesFilteredByPattern('dotted')}
          paint={useMapSymbology.getPaintSymbology().lineSelectedDotted}
        />
        <Layer
          type={'line'}
          id={'lineLayerSelectedDashed'}
          filter={useMapSymbology.getLinesFilteredByPattern('dashed')}
          paint={useMapSymbology.getPaintSymbology().lineSelectedDashed}
        />
        <Layer
          type={'line'}
          id={'lineLayerSelectedDotDashed'}
          filter={useMapSymbology.getLinesFilteredByPattern('dotDashed')}
          paint={useMapSymbology.getPaintSymbology().lineSelectedDotDashed}
        />
        <Layer
          type={'symbol'}
          id={'lineLabelLayerSelected'}
          filter={['==', ['geometry-type'], 'LineString']}
          layout={useMapSymbology.getLayoutSymbology().lineLabel}
        />

      </Source>

      {/* Draw Layer */}
      <Source
        id={'drawFeatures'}
        type={'geojson'}
        data={turf.featureCollection(drawFeatures)}
      >
        <Layer
          type={'circle'}
          id={'pointLayerDraw'}
          filter={['==', ['geometry-type'], 'Point']}
          paint={useMapSymbology.getPaintSymbology().pointDraw}
        />
        <Layer
          type={'line'}
          id={'lineLayerDraw'}
          filter={['==', ['geometry-type'], 'LineString']}
          paint={useMapSymbology.getPaintSymbology().lineDraw}
        />
        <Layer
          type={'fill'}
          id={'polygonLayerDraw'}
          filter={['==', ['geometry-type'], 'Polygon']}
          paint={useMapSymbology.getPaintSymbology().polygonDraw}
        />
      </Source>

      {/* Edit Layer */}
      <Source
        id={'editFeatureVertex'}
        type={'geojson'}
        data={turf.featureCollection(editFeatureVertex)}
      >
        <Layer
          type={'circle'}
          id={'pointLayerEdit'}
          filter={['==', ['geometry-type'], 'Point']}
          paint={useMapSymbology.getPaintSymbology().pointEdit}
        />
      </Source>

      {/* Strat Section X Lines Layer for Covered/Uncovered or Not Measured Intervals */}
      {stratSection && (
        <CoveredIntervalsXLines spotsDisplayed={[...spotsNotSelected, ...spotsSelected]}/>
      )}

      {/* Measure Layer */}
      <Source
        id={'mapMeasure'}
        type={'geojson'}
        data={turf.featureCollection(measureFeatures)}
      >
        <Layer
          type={'circle'}
          id={'measureLayerPoints'}
          filter={['==', ['geometry-type'], 'Point']}
          paint={useMapSymbology.getPaintSymbology().pointMeasure}
        />
        <Layer
          type={'line'}
          id={'measureLayerLines'}
          filter={['==', ['geometry-type'], 'LineString']}
          paint={useMapSymbology.getPaintSymbology().lineMeasure}
        />
      </Source>

    </Map>
  );
};

export default forwardRef(Basemap);
