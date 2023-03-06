import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import proj4 from 'proj4';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import config from '../../utils/config';
import {
  GEO_LAT_LNG_PROJECTION,
  LATITUDE,
  LONGITUDE,
  PIXEL_PROJECTION,
  STRAT_SECTION_CENTER,
  ZOOM,
} from './maps.constants';
import {STRAT_PATTERNS} from './strat-section/stratSection.constants';
import {MAP_SYMBOLS} from './symbology/mapSymbology.constants';
import useMapSymbologyHook from './symbology/useMapSymbology';
import useMapsHook from './useMaps';
import useMapViewHook from './useMapView';

mapboxgl.accessToken = config.get('mapbox_access_token');

const Basemap = (props) => {
  const center = useSelector(state => state.map.center || [LONGITUDE, LATITUDE]);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const zoom = useSelector(state => state.map.zoom || ZOOM);

  const {mapRef} = props.forwardedRef;

  const [useMaps] = useMapsHook();
  const [useMapSymbology] = useMapSymbologyHook();
  const useMapView = useMapViewHook();

  const [symbols, setSymbol] = useState({...MAP_SYMBOLS, ...STRAT_PATTERNS});
  const [initialCenter, setInitialCenter] = useState(center);
  const [initialZoom, setInitialZoom] = useState(zoom);

  const mapContainer = useRef(null);

  useEffect(() => {
    console.log('UE Basemap', mapRef, props.basemap);
    setInitialCenter(getCenterCoordinates());
    setInitialZoom(getZoomLevel());
    if (mapRef.current) return; // initialize map only once  DOESN'T SEEM TO WORK
    if (!mapRef.current) {
      console.log('Initializing Basemap...');
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        center: initialCenter,
        zoom: initialZoom,
      });
    }
    // Clean up on unmount
    return () => mapRef.current.remove();
  }, []);

  useEffect(() => {
    console.log('UE Basemap - Changed props.basemap', props.basemap);

    const setStyle = async () => {
      if (mapRef.current) {
        console.log('Setting style...');
        await mapRef.current.setStyle(props.basemap);
        console.log('Set style.');
        addLayers();
      }
    };

    if (!props.imageBasemap && !props.stratSection) setStyle();
  }, [props.basemap]);

  useEffect(() => {
    if (mapRef.current.getSource('spotsNotSelectedSource')) {
      mapRef.current.getSource('spotsNotSelectedSource').setData(
        turf.featureCollection(useMapSymbology.addSymbology(useMaps.getSpotsAsFeatures(props.spotsNotSelected))));
    }
  }, [props.spotsNotSelected]);

  useEffect(() => {
    if (mapRef.current.getSource('spotsSelectedSource')) {
      mapRef.current.getSource('spotsSelectedSource').setData(
        turf.featureCollection(useMapSymbology.addSymbology(useMaps.getSpotsAsFeatures(props.spotsSelected))));
    }
    if (mapRef.current.getSource('pointSpotsSelectedSource')) {
      mapRef.current.getSource('pointSpotsSelectedSource').setData(
        turf.featureCollection(useMapSymbology.addSymbology(props.spotsSelected)));
    }
  }, [props.spotsSelected]);

  useEffect(() => {
    // Add the image to the map style.
    const loadImage = (id) => {
      mapRef.current.loadImage(
        symbols[id], (error, image) => {
          if (error) throw error;
          if (!mapRef.current.hasImage(id)) mapRef.current.addImage(id, image);
          if (mapRef.current.hasImage(id)) console.log('Added Image:', id);
        });
    };

    mapRef.current?.on('styleimagemissing', (e) => {
      const id = e.id; // id of the missing image
      console.log(id, e);
      loadImage(id);
    });

    mapRef.current?.on('moveend', async () => {
      console.log('A moveend event occurred.');
      props.spotsInMapExtent();
      if (!props.imageBasemap && !props.stratSection && mapRef?.current) {
        const newCenter = mapRef.current.getCenter().toArray();
        const newZoom = mapRef.current.getZoom();
        useMapView.setMapView(newCenter, newZoom);
      }
    });

    mapRef.current?.on('click', props.onMapPress);
  }, []);

  // Add Features Layers (Not Selected Spots)
  const addFeaturesLayers = () => {
    // Clean the Layers (Remove the Source and Layers)
    if (mapRef.current.getSource('spotsNotSelectedSource')) {
      const layerIds = ['polygonLayerNotSelected', 'polygonLayerWithPatternNotSelected', 'polygonLayerNotSelectedBorder',
        'polygonLabelLayerNotSelected', 'lineLayerNotSelected', 'lineLayerNotSelectedDotted',
        'lineLayerNotSelectedDashed', 'lineLayerNotSelectedDotDashed', 'lineLabelLayerNotSelected',
        'pointLayerNotSelected'];
      layerIds.forEach((layerId) => {
        if (mapRef.current.getLayer(layerId)) mapRef.current.removeLayer(layerId);
      });
      mapRef.current.removeSource('spotsNotSelectedSource');
    }

    console.log('Adding features layers (not selected spots)...');

    // Add Source: Spots Not Selected
    mapRef.current.addSource('spotsNotSelectedSource', {
      type: 'geojson',
      data: turf.featureCollection(useMapSymbology.addSymbology(useMaps.getSpotsAsFeatures(props.spotsNotSelected))),
    });

    // Add Layer: Polygon Not Selected
    mapRef.current.addLayer({
      id: 'polygonLayerNotSelected',
      type: 'fill',
      source: 'spotsNotSelectedSource', // reference the data source
      filter: ['all', ['==', ['geometry-type'], 'Polygon'], ['!', ['has', 'fillPattern', ['get', 'symbology']]]],
      paint: useMapSymbology.getMapSymbology().polygon,
    });
    mapRef.current.addLayer({
      id: 'polygonLayerWithPatternNotSelected',
      type: 'fill',
      source: 'spotsNotSelectedSource', // reference the data source
      filter: ['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]],
      paint: useMapSymbology.getMapSymbology().polygonWithPattern,
    });
    mapRef.current.addLayer({
      id: 'polygonLayerNotSelectedBorder',
      type: 'line',
      source: 'spotsNotSelectedSource', // reference the data source
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: useMapSymbology.getMapSymbology().line,
    });
    mapRef.current.addLayer({
      id: 'polygonLabelLayerNotSelected',
      type: 'symbol',
      source: 'spotsNotSelectedSource', // reference the data source
      filter: ['==', ['geometry-type'], 'Polygon'],
      layout: useMapSymbology.getMapSymbology().polygonLabel,
    });

    // Add Layer: Line Not Selected
    // Need 4 different lines for the different types of line dashes since
    // lineDasharray is not suppported with data-driven styling
    mapRef.current.addLayer({
      id: 'lineLayerNotSelected',
      type: 'line',
      source: 'spotsNotSelectedSource', // reference the data source
      filter: useMapSymbology.getLinesFilteredByPattern('solid'),
      paint: useMapSymbology.getMapSymbology().line,
    });
    mapRef.current.addLayer({
      id: 'lineLayerNotSelectedDotted',
      type: 'line',
      source: 'spotsNotSelectedSource', // reference the data source
      filter: useMapSymbology.getLinesFilteredByPattern('dotted'),
      paint: useMapSymbology.getMapSymbology().lineDotted,
    });
    mapRef.current.addLayer({
      id: 'lineLayerNotSelectedDashed',
      type: 'line',
      source: 'spotsNotSelectedSource', // reference the data source
      filter: useMapSymbology.getLinesFilteredByPattern('dashed'),
      paint: useMapSymbology.getMapSymbology().lineDashed,
    });
    mapRef.current.addLayer({
      id: 'lineLayerNotSelectedDotDashed',
      type: 'line',
      source: 'spotsNotSelectedSource', // reference the data source
      filter: useMapSymbology.getLinesFilteredByPattern('dotDashed'),
      paint: useMapSymbology.getMapSymbology().lineDotDashed,
    });
    mapRef.current.addLayer({
      id: 'lineLabelLayerNotSelected',
      type: 'symbol',
      source: 'spotsNotSelectedSource', // reference the data source
      filter: ['==', ['geometry-type'], 'LineString'],
      layout: useMapSymbology.getMapSymbology().lineLabel,
    });

    // Add Layer: Point Not Selected
    mapRef.current.addLayer({
      id: 'pointLayerNotSelected',
      type: 'symbol',
      source: 'spotsNotSelectedSource', // reference the data source
      filter: ['==', ['geometry-type'], 'Point'],
      layout: useMapSymbology.getMapSymbology().point,
    });
    if (mapRef.current.getLayer('pointLayerNotSelected')) console.log('Added Layer: pointLayerNotSelected');

    console.log('Finished adding features layers (not selected spots).');
  };

  // Add Selected Features Layers (Selected Spots)
  const addFeaturesLayersSelected = () => {
    // Clean the Layers (Remove the Sources and Layers)
    if (mapRef.current.getSource('spotsSelectedSource')) {
      const layerIds = ['polygonLayerSelected', 'polygonLayerWithPatternSelected', 'polygonLayerSelectedBorder',
        'polygonLabelLayerSelected', 'lineLayerSelected', 'lineLayerSelectedDotted',
        'lineLayerSelectedDashed', 'lineLayerSelectedDotDashed', 'lineLabelLayerSelected',
        'pointLayerSelectedHalo'];
      layerIds.forEach((layerId) => {
        if (mapRef.current.getLayer(layerId)) mapRef.current.removeLayer(layerId);
      });
      mapRef.current.removeSource('spotsSelectedSource');
    }
    if (mapRef.current.getSource('pointSpotsSelectedSource')) {
      const layerIds = ['pointLayerSelectedHalo'];
      layerIds.forEach((layerId) => {
        if (mapRef.current.getLayer(layerId)) mapRef.current.removeLayer(layerId);
      });
      mapRef.current.removeSource('pointSpotsSelectedSource');
    }

    console.log('Adding selected features layers (selected spots)...');

    // Add Source: Spots Not Selected
    mapRef.current.addSource('spotsSelectedSource', {
      type: 'geojson',
      data: turf.featureCollection(useMapSymbology.addSymbology(useMaps.getSpotsAsFeatures(props.spotsSelected))),
    });

    // Add Layer: Polygon Selected
    mapRef.current.addLayer({
      id: 'polygonLayerSelected',
      type: 'fill',
      source: 'spotsSelectedSource', // reference the data source
      filter: ['all', ['==', ['geometry-type'], 'Polygon'], ['!', ['has', 'fillPattern', ['get', 'symbology']]]],
      paint: useMapSymbology.getMapSymbology().polygonSelected,
    });
    mapRef.current.addLayer({
      id: 'polygonLayerWithPatternSelected',
      type: 'fill',
      source: 'spotsSelectedSource', // reference the data source
      filter: ['all', ['==', ['geometry-type'], 'Polygon'], ['has', 'fillPattern', ['get', 'symbology']]],
      paint: useMapSymbology.getMapSymbology().polygonWithPatternSelected,
    });
    mapRef.current.addLayer({
      id: 'polygonLayerSelectedBorder',
      type: 'line',
      source: 'spotsSelectedSource', // reference the data source
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: useMapSymbology.getMapSymbology().line,
    });
    mapRef.current.addLayer({
      id: 'polygonLabelLayerSelected',
      type: 'symbol',
      source: 'spotsSelectedSource', // reference the data source
      filter: ['==', ['geometry-type'], 'Polygon'],
      layout: useMapSymbology.getMapSymbology().polygonLabel,
    });

    // Add Layer: Line Selected
    // Need 4 different lines for the different types of line dashes since
    // lineDasharray is not suppported with data-driven styling
    mapRef.current.addLayer({
      id: 'lineLayerSelected',
      type: 'line',
      source: 'spotsSelectedSource', // reference the data source
      filter: useMapSymbology.getLinesFilteredByPattern('solid'),
      paint: useMapSymbology.getMapSymbology().lineSelected,
    });
    mapRef.current.addLayer({
      id: 'lineLayerSelectedDotted',
      type: 'line',
      source: 'spotsSelectedSource', // reference the data source
      filter: useMapSymbology.getLinesFilteredByPattern('dotted'),
      paint: useMapSymbology.getMapSymbology().lineSelectedDotted,
    });
    mapRef.current.addLayer({
      id: 'lineLayerSelectedDashed',
      type: 'line',
      source: 'spotsSelectedSource', // reference the data source
      filter: useMapSymbology.getLinesFilteredByPattern('dashed'),
      paint: useMapSymbology.getMapSymbology().lineSelectedDashed,
    });
    mapRef.current.addLayer({
      id: 'lineLayerSelectedDotDashed',
      type: 'line',
      source: 'spotsSelectedSource', // reference the data source
      filter: useMapSymbology.getLinesFilteredByPattern('dotDashed'),
      paint: useMapSymbology.getMapSymbology().lineSelectedDotDashed,
    });
    mapRef.current.addLayer({
      id: 'lineLabelLayerSelected',
      type: 'symbol',
      source: 'spotsSelectedSource', // reference the data source
      filter: ['==', ['geometry-type'], 'LineString'],
      layout: useMapSymbology.getMapSymbology().lineLabel,
    });

    mapRef.current.addSource('pointSpotsSelectedSource', {
      type: 'geojson',
      data: turf.featureCollection(useMapSymbology.addSymbology(props.spotsSelected)),
    });

    // Add Layer: Point Selected (Halo Around Selected Point)
    mapRef.current.addLayer({
      id: 'pointLayerSelectedHalo',
      type: 'circle',
      source: 'pointSpotsSelectedSource', // reference the data source
      filter: ['==', ['geometry-type'], 'Point'],
      paint: useMapSymbology.getMapSymbology().pointSelected,
    });
    if (mapRef.current.getLayer('pointLayerSelectedHalo')) console.log('Added Layer: pointLayerSelectedHalo');

    console.log('Finished adding selected features layers (selected spots).');
  };

  const addLayers = () => {
    console.log('Loading layers...');

    addFeaturesLayers();
    addFeaturesLayersSelected();

    console.log('Finished loading layers.');
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

  const getZoomLevel = () => {
    console.log('Getting initial zoom...');
    if (props.imageBasemap) return 14;
    else if (props.stratSection) return 18;
    return zoom;
  };

  return <View style={{flex: 1}} ref={mapContainer}/>;
};

export const MapLayer = React.forwardRef((props, ref2) => (
  <Basemap {...props} forwardedRef={ref2}/>
));
MapLayer.displayName = 'MapLayer';
