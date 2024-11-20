import React, {forwardRef, useEffect} from 'react';
import {Platform, useWindowDimensions} from 'react-native';

import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import {Layer, Map, ScaleControl, Source} from 'react-map-gl';
import {useDispatch, useSelector} from 'react-redux';

import {BACKGROUND, MAP_MODES, MAPBOX_TOKEN} from './maps.constants';
import {setIsMapMoved} from './maps.slice';
import CoveredIntervalsXLines from './strat-section/CoveredIntervalsXLines';
import {STRAT_PATTERNS} from './strat-section/stratSection.constants';
import StratSectionBackground from './strat-section/StratSectionBackground';
import {MAP_SYMBOLS} from './symbology/mapSymbology.constants';
import useMapSymbology from './symbology/useMapSymbology';
import useMap from './useMap';
import useMapCoords from './useMapCoords';
import useMapFeatures from './useMapFeatures';
import useMapMouseActions from './useMapMouseActions.web';
import useMapMoveEvents from './useMapMoveEvents';
import useMapURL from './useMapURL';
import useMapView from './useMapView';
import {isEmpty} from '../../shared/Helpers';
import {useImages} from '../images';
import mapStyles from './maps.styles';

const Basemap = ({
                   allowMapViewMove,
                   basemap,
                   drawFeatures,
                   editFeatureVertex,
                   handleMapLongPress,
                   handleMapPress,
                   mapMode,
                   measureFeatures,
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

  const [viewState, setViewState] = React.useState({});

  const useDimensions = useWindowDimensions();
  const {getImageScreenSizedURI, getLocalImageURI} = useImages();
  const {isDrawMode} = useMap();
  const {getCoordQuad} = useMapCoords();
  const {getSpotsAsFeatures} = useMapFeatures();
  const {handleMapMoved} = useMapMoveEvents({setViewState});
  const {cursor, handleMouseEnter, handleMouseLeave} = useMapMouseActions({editFeatureVertex, mapRef, mapMode});
  const {addSymbology, getLayoutSymbology, getLinesFilteredByPattern, getPaintSymbology} = useMapSymbology();
  const {buildTileURL} = useMapURL();
  const {getInitialViewState} = useMapView();

  const layerIdsNotSelected = ['polygonLayerNotSelected', 'polygonLayerWithPatternNotSelected',
    'polygonLayerNotSelectedBorder', 'polygonLabelLayerNotSelected', 'lineLayerNotSelected',
    'lineLayerNotSelectedDotted', 'lineLayerNotSelectedDashed', 'lineLayerNotSelectedDotDashed',
    'lineLabelLayerNotSelected', 'pointLayerNotSelected'];
  const layerIdsSelected = ['polygonLayerSelected', 'polygonLayerWithPatternSelected',
    'polygonLayerSelectedBorder', 'polygonLabelLayerSelected', 'lineLayerSelected', 'lineLayerSelectedDotted',
    'lineLayerSelectedDashed', 'lineLayerSelectedDotDashed', 'lineLabelLayerSelected', 'pointLayerSelectedHalo'];
  const symbols = {...MAP_SYMBOLS, ...STRAT_PATTERNS};

  const coordQuad = getCoordQuad(currentImageBasemap);

  // Get selected and not selected Spots as features, split into multiple features if multiple orientations
  const featuresNotSelected = turf.featureCollection(getSpotsAsFeatures(addSymbology(spotsNotSelected)));
  const featuresSelected = turf.featureCollection(getSpotsAsFeatures(addSymbology(spotsSelected)));

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
      setViewState(getInitialViewState());
    }, [currentImageBasemap, stratSection],
  );

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

  return (
    <Map
      {...viewState}
      boxZoom={allowMapViewMove}
      cursor={cursor}
      doubleClickZoom={!(isDrawMode(mapMode) || mapMode === MAP_MODES.EDIT)}
      dragPan={allowMapViewMove}
      dragRotate={false}
      id={currentImageBasemap ? currentImageBasemap.id : stratSection ? stratSection.strat_section_id : basemap.id}
      interactiveLayerIds={[...layerIdsNotSelected, ...layerIdsSelected]}
      mapStyle={currentImageBasemap || stratSection ? BACKGROUND : basemap}
      mapboxAccessToken={MAPBOX_TOKEN}
      onClick={handleMapPress}
      onDblClick={handleMapLongPress}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMoveEnd={handleMapMoved}   // Update spots in extent and saved view (center and zoom)
      pitchWithRotate={false}
      ref={mapRef}
      style={{flex: 1}}
      styleDiffing={false}
      touchPitch={false}
      touchZoomRotate={false}
    >

      {!stratSection && !currentImageBasemap && (
        <ScaleControl
          maxWidth={useDimensions.width * 0.25}
          unit={'imperial'}
          style={mapStyles.scaleWeb}
        />
      )}

      {/* Custom Overlay Layer */}
      {!currentImageBasemap && !stratSection && Object.values(customMaps).map((customMap) => {
        return (
          customMap.overlay && customMap.isViewable && (
            <Source
              key={customMap.id}
              id={customMap.id}
              type={'raster'}
              tiles={[buildTileURL(customMap)]}
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
          paint={getPaintSymbology().pointSelected}
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
          paint={getPaintSymbology().pointColorHalo}
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
          paint={getPaintSymbology().polygon}
        />
        <Layer
          type={'fill'}
          id={'polygonLayerWithPatternNotSelected'}
          filter={['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]]}
          paint={getPaintSymbology().polygonWithPattern}
        />
        <Layer
          type={'line'}
          id={'polygonLayerNotSelectedBorder'}
          filter={['==', ['geometry-type'], 'Polygon']}
          paint={getPaintSymbology().line}
        />
        <Layer
          type={'symbol'}
          id={'polygonLabelLayerNotSelected'}
          filter={['==', ['geometry-type'], 'Polygon']}
          layout={getLayoutSymbology().polygonLabel}
        />

        {/* Line Not Selected */}
        {/* Need 4 different lines for the different types of line dashes since
         lineDasharray is not supported with data-driven styling*/}
        <Layer
          type={'line'}
          id={'lineLayerNotSelected'}
          filter={getLinesFilteredByPattern('solid')}
          paint={getPaintSymbology().line}
        />
        <Layer
          type={'line'}
          id={'lineLayerNotSelectedDotted'}
          filter={getLinesFilteredByPattern('dotted')}
          paint={getPaintSymbology().lineDotted}
        />
        <Layer
          type={'line'}
          id={'lineLayerNotSelectedDashed'}
          filter={getLinesFilteredByPattern('dashed')}
          paint={getPaintSymbology().lineDashed}
        />
        <Layer
          type={'line'}
          id={'lineLayerNotSelectedDotDashed'}
          filter={getLinesFilteredByPattern('dotDashed')}
          paint={getPaintSymbology().lineDotDashed}
        />
        <Layer
          type={'symbol'}
          id={'lineLabelLayerNotSelected'}
          filter={['==', ['geometry-type'], 'LineString']}
          layout={getLayoutSymbology().lineLabel}
        />

        {/* Point Not Selected */}
        <Layer
          type={'symbol'}
          id={'pointLayerNotSelected'}
          filter={['==', ['geometry-type'], 'Point']}
          layout={getLayoutSymbology().point}
          paint={getPaintSymbology().point}
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
          paint={getPaintSymbology().polygonSelected}
        />
        <Layer
          type={'fill'}
          id={'polygonLayerWithPatternSelected'}
          filter={['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]]}
          paint={getPaintSymbology().polygonWithPatternSelected}
        />
        <Layer
          type={'line'}
          id={'polygonLayerSelectedBorder'}
          filter={['==', ['geometry-type'], 'Polygon']}
          paint={getPaintSymbology().line}
        />
        <Layer
          type={'symbol'}
          id={'polygonLabelLayerSelected'}
          filter={['==', ['geometry-type'], 'Polygon']}
          layout={getLayoutSymbology().polygonLabel}
        />

        {/* Line Selected */}
        {/* Need 4 different lines for the different types of line dashes since
         lineDasharray is not supported with data-driven styling*/}
        <Layer
          type={'line'}
          id={'lineLayerSelected'}
          filter={getLinesFilteredByPattern('solid')}
          paint={getPaintSymbology().lineSelected}
        />
        <Layer
          type={'line'}
          id={'lineLayerSelectedDotted'}
          filter={getLinesFilteredByPattern('dotted')}
          paint={getPaintSymbology().lineSelectedDotted}
        />
        <Layer
          type={'line'}
          id={'lineLayerSelectedDashed'}
          filter={getLinesFilteredByPattern('dashed')}
          paint={getPaintSymbology().lineSelectedDashed}
        />
        <Layer
          type={'line'}
          id={'lineLayerSelectedDotDashed'}
          filter={getLinesFilteredByPattern('dotDashed')}
          paint={getPaintSymbology().lineSelectedDotDashed}
        />
        <Layer
          type={'symbol'}
          id={'lineLabelLayerSelected'}
          filter={['==', ['geometry-type'], 'LineString']}
          layout={getLayoutSymbology().lineLabel}
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
          paint={getPaintSymbology().pointDraw}
        />
        <Layer
          type={'line'}
          id={'lineLayerDraw'}
          filter={['==', ['geometry-type'], 'LineString']}
          paint={getPaintSymbology().lineDraw}
        />
        <Layer
          type={'fill'}
          id={'polygonLayerDraw'}
          filter={['==', ['geometry-type'], 'Polygon']}
          paint={getPaintSymbology().polygonDraw}
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
          paint={getPaintSymbology().pointEdit}
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
          paint={getPaintSymbology().pointMeasure}
        />
        <Layer
          type={'line'}
          id={'measureLayerLines'}
          filter={['==', ['geometry-type'], 'LineString']}
          paint={getPaintSymbology().lineMeasure}
        />
      </Source>

    </Map>
  );
};

export default forwardRef(Basemap);
