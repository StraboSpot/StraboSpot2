import React, {useEffect, useState} from 'react';
import {Platform, View} from 'react-native';

import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import proj4 from 'proj4';
import {Layer, Map, Source, ScaleControl} from 'react-map-gl';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import homeStyles from '../home/home.style';
import useImagesHook from '../images/useImages';
import {
  BACKGROUND,
  GEO_LAT_LNG_PROJECTION,
  LATITUDE,
  LONGITUDE,
  MAP_MODES,
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

const Basemap = (props) => {
  console.log('Rendering Basemap...');
  console.log('Basemap props:', props);

  const center = useSelector(state => state.map.center) || [LONGITUDE, LATITUDE];
  const customMaps = useSelector(state => state.map.customMaps);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const zoom = useSelector(state => state.map.zoom) || ZOOM;

  const {mapRef} = props.forwardedRef;

  const [useImages] = useImagesHook();
  const [useMapSymbology] = useMapSymbologyHook();
  const [useMaps] = useMapsHook(mapRef);
  const useMapView = useMapViewHook();

  const [cursor, setCursor] = useState('');
  const [prevMapMode, setPrevMapMode] = useState(props.mapMode);
  const [symbols, setSymbol] = useState({...MAP_SYMBOLS, ...STRAT_PATTERNS});
  const [viewState, setViewState] = React.useState({});

  const layerIdsNotSelected = ['polygonLayerNotSelected', 'polygonLayerWithPatternNotSelected',
    'polygonLayerNotSelectedBorder', 'polygonLabelLayerNotSelected', 'lineLayerNotSelected',
    'lineLayerNotSelectedDotted', 'lineLayerNotSelectedDashed', 'lineLayerNotSelectedDotDashed',
    'lineLabelLayerNotSelected', 'pointLayerNotSelected'];
  const layerIdsSelected = ['polygonLayerSelected', 'polygonLayerWithPatternSelected',
    'polygonLayerSelectedBorder', 'polygonLabelLayerSelected', 'lineLayerSelected', 'lineLayerSelectedDotted',
    'lineLayerSelectedDashed', 'lineLayerSelectedDotDashed', 'lineLabelLayerSelected', 'pointLayerSelectedHalo'];

  const coordQuad = useMaps.getCoordQuad(props.imageBasemap);

  // Get selected and not selected Spots as features, split into multiple features if multiple orientations
  const featuresNotSelected = turf.featureCollection(
    useMaps.getSpotsAsFeatures(useMapSymbology.addSymbology(props.spotsNotSelected)));
  const featuresSelected = turf.featureCollection(
    useMaps.getSpotsAsFeatures(useMapSymbology.addSymbology(props.spotsSelected)));

  // Get only 1 selected and not selected feature per id for colored halos so multiple halos aren't stacked
  const featuresNotSelectedUniq = turf.featureCollection(
    featuresNotSelected.features?.reduce((acc, f) =>
      acc.map(f1 => f1.properties.id).includes(f.properties.id) ? acc : [...acc, f], []));
  const featuresSelectedUniq = turf.featureCollection(
    featuresSelected.features?.reduce((acc, f) =>
      acc.map(f1 => f1.properties.id).includes(f.properties.id) ? acc : [...acc, f], []));

  useEffect(() => {
      console.log('UE Basemap', viewState);
      setInitialViewState();
    }, [props.imageBasemap, props.stratSection],
  );

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

  // Set initial center and zoom
  const setInitialViewState = () => {
    console.log('Getting initial center...');
    let initialCenter = center;
    if (props.zoomToSpot && !isEmpty(selectedSpot)) {
      if ((props.imageBasemap && selectedSpot.properties.image_basemap === props.imageBasemap.id)
        || (props.stratSection && selectedSpot.properties.strat_section_id === props.stratSection.strat_section_id)) {
        initialCenter = proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION,
          turf.centroid(selectedSpot).geometry.coordinates);
      }
      else if (!selectedSpot.properties.image_basemap && !selectedSpot.properties.strat_section_id) {
        initialCenter = turf.centroid(selectedSpot).geometry.coordinates;
      }
    }
    else if (props.imageBasemap) {
      initialCenter = proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION,
        [(props.imageBasemap.width) / 2, (props.imageBasemap.height) / 2]);
    }
    else if (props.stratSection) initialCenter = STRAT_SECTION_CENTER;

    console.log('Getting initial zoom...');
    let initialZoom = zoom;
    if (props.imageBasemap) initialZoom = ZOOM;
    else if (props.stratSection) initialZoom = ZOOM_STRAT_SECTION;

    const initialViewState = {
      longitude: initialCenter[0],
      latitude: initialCenter[1],
      zoom: initialZoom,
    };

    console.log('Setting Initial View State', initialViewState);
    setViewState(initialViewState);
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

  // Update spots in extent and saved view (center and zoom)
  const onMove = (evt) => {
    console.log('Event onMove', evt);
    props.updateSpotsInMapExtent();
    if (props.imageBasemap || props.stratSection) setViewState(evt.viewState);
    else {
      console.log('evt.viewState', evt.viewState);
      setViewState(evt.viewState);
      const newCenter = [evt.viewState.longitude, evt.viewState.latitude];
      const newZoom = evt.viewState.zoom;
      useMapView.setMapView(newCenter, newZoom);
    }
  };

  const onMouseEnter = () => {
    if (props.mapMode === MAP_MODES.VIEW) setCursor('pointer');
  };

  const onMouseLeave = () => {
    if (props.mapMode === MAP_MODES.VIEW) setCursor('');
    else if (useMaps.isDrawMode(props.mapMode) || props.mapMode === MAP_MODES.EDIT) setCursor('pointer');
  };

  return (
    <View style={{flex: 1}}>
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
        onMove={onMove}   // Update spots in extent and saved view (center and zoom)
        mapboxAccessToken={MAPBOX_TOKEN}
        cursor={cursor}
        interactiveLayerIds={[...layerIdsNotSelected, ...layerIdsSelected]}
        styleDiffing={false}
      >
        {!props.stratSection && !props.imageBasemap && (
          <View>
            <ScaleControl
              unit={'imperial'}
              style={{position: 'absolute', left: 50, bottom: 20}}
            />
            <ScaleControl
              unit={'metric'}
              style={{position: 'absolute', left: 50, bottom: 40}}
            />
          </View>
        )}

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

        {/* Strat Section background Layer */}
        {props.stratSection && (
          <StratSectionBackground maxXY={getStratIntervalsMaxXY()} stratSection={props.stratSection}/>
        )}

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
