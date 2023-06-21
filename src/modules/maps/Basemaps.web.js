import React, {useCallback, useState} from 'react';
import {Platform, View} from 'react-native';

import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, {Layer, Source} from 'react-map-gl';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import useImagesHook from '../images/useImages';
import {BACKGROUND, MAP_MODES, MAPBOX_TOKEN} from './maps.constants';
import {setViewStateGeo, setViewStateImageBasemap, setViewStateStratSection} from './maps.slice';
import CoveredIntervalsXLines from './strat-section/CoveredIntervalsXLines';
import {STRAT_PATTERNS} from './strat-section/stratSection.constants';
import {MAP_SYMBOLS} from './symbology/mapSymbology.constants';
import useMapSymbologyHook from './symbology/useMapSymbology';
import useMapsHook from './useMaps';

const Basemap = (props) => {
  console.log('Rendering Basemap...');
  console.log('Basemap props:', props);

  const dispatch = useDispatch();

  const customMaps = useSelector(state => state.map.customMaps);
  const viewStateGeo = useSelector(state => state.map.viewStateGeo);
  const viewStateImageBasemap = useSelector(state => state.map.viewStateImageBasemap);
  const viewStateStratSection = useSelector(state => state.map.viewStateStratSection);

  const {mapRef} = props.forwardedRef;

  const [useImages] = useImagesHook();
  const [useMapSymbology] = useMapSymbologyHook();
  const [useMaps] = useMapsHook(mapRef);

  const [cursor, setCursor] = useState('');
  const [prevMapMode, setPrevMapMode] = useState(props.mapMode);
  const [symbols, setSymbol] = useState({...MAP_SYMBOLS, ...STRAT_PATTERNS});

  const layerIdsNotSelected = ['polygonLayerNotSelected', 'polygonLayerWithPatternNotSelected',
    'polygonLayerNotSelectedBorder', 'polygonLabelLayerNotSelected', 'lineLayerNotSelected',
    'lineLayerNotSelectedDotted', 'lineLayerNotSelectedDashed', 'lineLayerNotSelectedDotDashed',
    'lineLabelLayerNotSelected', 'pointLayerNotSelected'];
  const layerIdsSelected = ['polygonLayerSelected', 'polygonLayerWithPatternSelected',
    'polygonLayerSelectedBorder', 'polygonLabelLayerSelected', 'lineLayerSelected', 'lineLayerSelectedDotted',
    'lineLayerSelectedDashed', 'lineLayerSelectedDotDashed', 'lineLabelLayerSelected', 'pointLayerSelectedHalo'];

  const viewState = props.imageBasemap ? viewStateImageBasemap
    : props.stratSection ? viewStateStratSection
      : viewStateGeo;
  const coordQuad = useMaps.getCoordQuad(props.imageBasemap);

  if (props.mapMode !== prevMapMode) {
    console.log('MapMode changed from', prevMapMode, 'to', props.mapMode);
    setPrevMapMode(props.mapMode);
    if (useMaps.isDrawMode(props.mapMode) || props.mapMode === MAP_MODES.EDIT) setCursor('pointer');
    else setCursor('');
  }

  if (mapRef.current) {
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
  }

  // Update spots in extent and save view state (center and zoom)
  const onMove = useCallback((evt) => {
    console.log('Event onMove');
    const newViewState = evt.viewState;
    console.log('Setting new view state...', newViewState);
    if (props.imageBasemap) dispatch(setViewStateImageBasemap(newViewState));
    else if (props.stratSection) dispatch(setViewStateStratSection(newViewState));
    else dispatch(setViewStateGeo(newViewState));
    props.spotsInMapExtent();
  }, [props.imageBasemap, props.spotsInMapExtent, props.stratSection, dispatch, useMaps]);

  const onMouseEnter = () => {
    if (props.mapMode === MAP_MODES.VIEW) setCursor('pointer');
  };

  const onMouseLeave = () => {
    if (props.mapMode === MAP_MODES.VIEW) setCursor('');
    else if (useMaps.isDrawMode(props.mapMode) || props.mapMode === MAP_MODES.EDIT) setCursor('pointer');
  };

  return (
    <View style={{flex: 1}}>
      {/*{!props.stratSection && !props.imageBasemap && (*/}
      {/*  <View style={homeStyles.zoomAndScaleBarContainer}>*/}
      {/*    <ScaleBarAndZoom basemap={props.basemap} latitude={viewState.latitude} zoom={zoom}/>*/}
      {/*  </View>*/}
      {/*)}*/}
      <Map
        {...viewState}
        id={props.imageBasemap ? props.imageBasemap.id : props.stratSection ? props.stratSection.strat_section_id
          : props.basemap.id}
        ref={mapRef}
        style={{flex: 1}}
        mapStyle={props.imageBasemap || props.stratSection ? BACKGROUND : props.basemap}
        boxZoom={props.allowMapViewMove}
        dragRotate={props.allowMapViewMove}
        dragPan={props.allowMapViewMove}
        pitchWithRotate={false}
        touchPitch={!(props.stratSection || props.imageBasemap)}
        touchZoomRotate={false}
        onClick={props.onMapPress}
        onDblClick={props.onMapLongPress}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMove={onMove}
        mapboxAccessToken={MAPBOX_TOKEN}
        cursor={cursor}
        interactiveLayerIds={[...layerIdsNotSelected, ...layerIdsSelected]}
      >

        {/* Custom Overlay Layer */}
        {Object.values(customMaps).map((customMap) => {
          return (
            customMap.overlay && customMap.isViewable && (
              <Source
                key={customMap.id}
                id={customMap.id}
                type={'raster'}
                tiles={[useMaps.buildTileUrl(customMap)]}
              >
                <Layer
                  type={'raster'}
                  id={customMap.id + 'Layer'}
                  paint={{
                    'raster-opacity': customMap.opacity && typeof (customMap.opacity) === 'number'
                    && customMap.opacity >= 0 && customMap.opacity <= 1 ? customMap.opacity : 1,
                  }}
                />
              </Source>
            )
          );
        })}

        {/* Image Basemap Layer */}
        {props.imageBasemap && !isEmpty(coordQuad) && (
          <Source
            id={'imageBasemap'}
            type={'image'}
            coordinates={coordQuad}
            url={Platform.OS === 'web' ? useImages.getImageScreenSizedURI(props.imageBasemap.id)
              : useImages.getLocalImageURI(props.imageBasemap.id)}
          >
            <Layer
              type={'raster'}
              id={'imageBasemapLayer'}
              paint={{'raster-opacity': 1}}
              beforeId={'pointLayerColorHalo'}
            />
          </Source>
        )}

        {/* Colored Halo Around Points Layer */}
        <Source
          id={'shapeSource'}
          type={'geojson'}
          data={turf.featureCollection(useMapSymbology.addSymbology(props.spotsNotSelected))}
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
          data={turf.featureCollection(
            useMapSymbology.addSymbology(useMaps.getSpotsAsFeatures(props.spotsNotSelected)))}
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
          data={turf.featureCollection(useMapSymbology.addSymbology(useMaps.getSpotsAsFeatures(props.spotsSelected)))}
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

        {/* Halo Around Selected Point Feature Layer */}
        <Source
          id={'pointSpotsSelectedSource'}
          type={'geojson'}
          data={turf.featureCollection(useMapSymbology.addSymbology(props.spotsSelected))}
        >
          <Layer
            type={'circle'}
            id={'pointLayerSelectedHalo'}
            filter={['==', ['geometry-type'], 'Point']}
            paint={useMapSymbology.getPaintSymbology().pointSelected}
          />
        </Source>

        {/* Draw Layer */}
        <Source
          id={'drawFeatures'}
          type={'geojson'}
          data={turf.featureCollection(props.drawFeatures)}
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
          data={turf.featureCollection(props.editFeatureVertex)}
        >
          <Layer
            type={'circle'}
            id={'pointLayerEdit'}
            filter={['==', ['geometry-type'], 'Point']}
            paint={useMapSymbology.getPaintSymbology().pointEdit}
          />
        </Source>

        {/* Strat Section X Lines Layer for Covered/Uncovered or Not Measured Intervals */}
        {props.stratSection && (
          <CoveredIntervalsXLines spotsDisplayed={[...props.spotsNotSelected, ...props.spotsSelected]}/>
        )}

        {/* Measure Layer */}
        <Source
          id={'mapMeasure'}
          type={'geojson'}
          data={turf.featureCollection(props.measureFeatures)}
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
    </View>
  );
};

export const MapLayer = React.forwardRef((props, ref2) => (
  <Basemap {...props} forwardedRef={ref2}/>
));
MapLayer.displayName = 'MapLayer';
