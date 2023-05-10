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
  MAP_MODES,
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
  console.log('Rendering Basemap...');
  console.log('Basemap props:', props);

  const center = useSelector(state => state.map.center) || [LONGITUDE, LATITUDE];
  const customMaps = useSelector(state => state.map.customMaps);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spot.spots);
  const zoom = useSelector(state => state.map.zoom) || ZOOM;

  const {mapRef} = props.forwardedRef;

  const [useMaps] = useMapsHook();
  const [useMapSymbology] = useMapSymbologyHook();
  const useMapView = useMapViewHook();

  const [initialCenter, setInitialCenter] = useState(center);
  const [initialZoom, setInitialZoom] = useState(zoom);
  const [symbols, setSymbol] = useState({...MAP_SYMBOLS, ...STRAT_PATTERNS});

  const mapContainer = useRef(null);

  const mapMode = useRef();
  const drawFeatures = useRef();

  const layerIdsNotSelected = ['polygonLayerNotSelected', 'polygonLayerWithPatternNotSelected',
    'polygonLayerNotSelectedBorder', 'polygonLabelLayerNotSelected', 'lineLayerNotSelected',
    'lineLayerNotSelectedDotted', 'lineLayerNotSelectedDashed', 'lineLayerNotSelectedDotDashed',
    'lineLabelLayerNotSelected', 'pointLayerNotSelected'];
  const layerIdsSelected = ['polygonLayerSelected', 'polygonLayerWithPatternSelected',
    'polygonLayerSelectedBorder', 'polygonLabelLayerSelected', 'lineLayerSelected', 'lineLayerSelectedDotted',
    'lineLayerSelectedDashed', 'lineLayerSelectedDotDashed', 'lineLabelLayerSelected', 'pointLayerSelectedHalo'];

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
        doubleClickZoom: false,
      });
    }

    const loadImage = (id) => {
      mapRef.current.loadImage(
        symbols[id], (error, image) => {
          if (error) throw error;
          if (!mapRef.current.hasImage(id)) mapRef.current.addImage(id, image);
          // if (mapRef.current.hasImage(id)) console.log('Added Image:', id);
        });
    };

    // Add the image to the map style.
    mapRef.current?.on('styleimagemissing', (e) => {
      const id = e.id; // id of the missing image
      // console.log(id, e);
      loadImage(id);
    });

    // Clean up on unmount
    return () => mapRef.current.remove();
  }, []);

  useEffect(() => {
    console.log('UE Basemap - Changed [props.allowMapViewMove]', props.allowMapViewMove);
    const handlers = ['boxZoom', 'dragRotate', 'dragPan'];
    handlers.forEach((handler) => {
      if (props.allowMapViewMove) mapRef.current?.[handler].enable();
      else mapRef.current?.[handler].disable();
    });
  }, [props.allowMapViewMove]);

  useEffect(() => {
    console.log('UE Basemap - Changed [props.mapMode]', props.mapMode);

    if (useMaps.isDrawMode(props.mapMode) || props.mapMode === MAP_MODES.EDIT) {
      mapRef.current.getCanvas().style.cursor = 'pointer';
    }

    mapRef.current?.on('mouseenter', [...layerIdsNotSelected, ...layerIdsSelected], (event) => {
      if (props.mapMode === MAP_MODES.VIEW && event.features?.length > 0) {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      }
    });

    mapRef.current?.on('mouseleave', [...layerIdsNotSelected, ...layerIdsSelected], () => {
      if (props.mapMode === MAP_MODES.VIEW) mapRef.current.getCanvas().style.cursor = '';
      else if (useMaps.isDrawMode(props.mapMode)  || props.mapMode === MAP_MODES.EDIT) {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      }
    });
  }, [props.mapMode]);

  useEffect(() => {
    console.log('UE Basemap - Changed [props.mapMode, props.drawFeatures]', props.mapMode, props.drawFeatures);

    mapMode.current = props.mapMode;
    drawFeatures.current = props.drawFeatures;

    mapRef.current?.on('click', (e) => {
      console.log('Set new onMapPress', props.mapMode, mapMode.current);
      props.onMapPress(e, mapMode.current, drawFeatures.current);
    });

    mapRef.current?.on('dblclick', (e) => {
      console.log('Set new onMapPress', props.mapMode, mapMode.current);
      props.onMapLongPress(e, mapMode.current, drawFeatures.current);
    });
  }, [props.mapMode, props.drawFeatures]);

  useEffect(() => {
    console.log('UE Basemap - Changed [spots]', spots);

    mapRef.current?.on('moveend', async () => {
      console.log('A moveend event occurred.');
      props.spotsInMapExtent();
      if (!props.imageBasemap && !props.stratSection && mapRef?.current) {
        const newCenter = mapRef.current.getCenter().toArray();
        const newZoom = mapRef.current.getZoom();
        useMapView.setMapView(newCenter, newZoom);
      }
    });
  }, [spots]);

  useEffect(() => {
    console.log('UE Basemap - Changed props.basemap', props.basemap);

    const setStyle = () => {
      if (mapRef.current) {
        console.log('Setting style...');
        mapRef.current.setStyle(props.basemap, true);

        mapRef.current?.once('styledata', () => {
          console.log('A styledata event occurred.');
          const waiting = () => {
            if (!mapRef.current.isStyleLoaded()) setTimeout(waiting, 200);
            else {
              console.log('Finished setting style.');
              addLayers();
            }
          };
          waiting();
        });
      }
    };

    if (!props.imageBasemap && !props.stratSection) setStyle();
  }, [props.basemap]);

  useEffect(() => {
    console.log('UE Basemap - Changed [customMaps]', customMaps);

    const waiting = () => {
      if (mapRef.current) {
        if (!mapRef.current.loaded()) setTimeout(waiting, 200);
        else addCustomMapsLayers();
      }
    };

    waiting();
  }, [customMaps]);

  useEffect(() => {
    console.log('UE Basemap - Changed [props.spotsNotSelected]', props.spotsNotSelected);

    const waiting = () => {
      if (mapRef.current) {
        if (!mapRef.current.isStyleLoaded() || !mapRef.current.getSource('spotsNotSelectedSource')) {
          setTimeout(waiting, 200);
        }
        else {
          mapRef.current?.getSource('spotsNotSelectedSource').setData(
            turf.featureCollection(useMapSymbology.addSymbology(useMaps.getSpotsAsFeatures(props.spotsNotSelected))));
          console.log('Updated spotsNotSelectedSource.');
        }
      }
    };

    waiting();
  }, [props.spotsNotSelected]);

  useEffect(() => {
    console.log('UE Basemap - Changed [props.spotsSelected]', props.spotsSelected);

    const waiting = () => {
      if (mapRef.current) {
        if (!mapRef.current.isStyleLoaded() || !mapRef.current.getSource('spotsSelectedSource')
          || !mapRef.current.getSource('pointSpotsSelectedSource')) setTimeout(waiting, 200);
        else {
          mapRef.current.getSource('spotsSelectedSource').setData(
            turf.featureCollection(useMapSymbology.addSymbology(useMaps.getSpotsAsFeatures(props.spotsSelected))));
          console.log('Updated spotsSelectedSource.');
          mapRef.current.getSource('pointSpotsSelectedSource').setData(
            turf.featureCollection(useMapSymbology.addSymbology(props.spotsSelected)));
          console.log('Updated pointSpotsSelectedSource.');
        }
      }
    };

    waiting();
  }, [props.spotsSelected]);

  useEffect(() => {
    console.log('UE Basemap - Changed [props.drawFeatures]', props.drawFeatures);

    const waiting = () => {
      if (mapRef.current) {
        if (!mapRef.current.isStyleLoaded() || !mapRef.current.getSource('drawFeatures')) {
          setTimeout(waiting, 200);
        }
        else {
          mapRef.current.getSource('drawFeatures').setData(turf.featureCollection(props.drawFeatures));
          console.log('Updated drawFeatures.');
        }
      }
    };

    waiting();
  }, [props.drawFeatures]);

  useEffect(() => {
    console.log('UE Basemap - Changed [props.editFeatureVertex]', props.editFeatureVertex);

    const waiting = () => {
      if (mapRef.current) {
        if (!mapRef.current.isStyleLoaded() || !mapRef.current.getSource('editFeatureVertex')) {
          setTimeout(waiting, 200);
        }
        else {
          mapRef.current.getSource('editFeatureVertex').setData(turf.featureCollection(props.editFeatureVertex));
          console.log('Updated editFeatureVertex.');
        }
      }
    };

    waiting();
  }, [props.editFeatureVertex]);

  // Add Features Layers (Not Selected Spots)
  const addFeaturesLayers = () => {
    // Clean the Layers (Remove the Source and Layers)
    if (mapRef.current.getSource('spotsNotSelectedSource')) {
      layerIdsNotSelected.forEach((layerId) => {
        if (mapRef.current.getLayer(layerId)) mapRef.current.removeLayer(layerId);
      });
      mapRef.current.removeSource('spotsNotSelectedSource');
    }

    console.log('Adding features layers (not selected spots)...', props.spotsNotSelected);

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
      layerIdsSelected.forEach((layerId) => {
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

    console.log('Adding selected features layers (selected spots)...', props.spotsSelected);

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

  const addCustomMapsLayers = () => {
    Object.values(customMaps).forEach((customMap) => {
      const layerId = customMap.id + 'Layer';
      const sourceId = customMap.id + 'Source';

      // Clean the Layers (Remove the Sources and Layers)
      if (mapRef.current.getSource(sourceId)) {
        if (mapRef.current.getLayer(layerId)) mapRef.current.removeLayer(layerId);
        mapRef.current.removeSource(sourceId);
      }

      if (customMap.overlay && customMap.isViewable) {
        console.log('Adding custom map layer...', customMap);

        // Add Source: Custom Map
        mapRef.current.addSource(sourceId, {
          type: 'raster',
          tiles: [useMaps.buildTileUrl(customMap)],
        });

        // Add Layer: Custom Map
        mapRef.current.addLayer({
          id: layerId,
          type: 'raster',
          source: sourceId, // reference the data source
          paint: {
            'raster-opacity': customMap.opacity && typeof (customMap.opacity) === 'number'
            && customMap.opacity >= 0 && customMap.opacity <= 1 ? customMap.opacity : 1,
          },
        });
        if (mapRef.current.getLayer(layerId)) console.log('Added Layer:', layerId);
      }
    });
  };

  const addDrawLayers = () => {
    // Clean the Layers (Remove the Source and Layers)
    if (mapRef.current.getSource('drawFeatures')) {
      const layerIds = ['pointLayerDraw', 'lineLayerDraw', 'polygonLayerDraw'];
      layerIds.forEach((layerId) => {
        if (mapRef.current.getLayer(layerId)) mapRef.current.removeLayer(layerId);
      });
      mapRef.current.removeSource('drawFeatures');
    }

    console.log('Adding draw layers ...', props.drawFeatures);

    // Add Source: Draw Features
    mapRef.current.addSource('drawFeatures', {
      type: 'geojson',
      data: turf.featureCollection(props.drawFeatures),
    });

    // Add Layers
    mapRef.current.addLayer({
      id: 'pointLayerDraw',
      type: 'circle',
      source: 'drawFeatures', // reference the data source
      filter: ['==', ['geometry-type'], 'Point'],
      paint: useMapSymbology.getMapSymbology().pointDraw,
    });
    mapRef.current.addLayer({
      id: 'lineLayerDraw',
      type: 'line',
      source: 'drawFeatures', // reference the data source
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: useMapSymbology.getMapSymbology().lineDraw,
    });
    mapRef.current.addLayer({
      id: 'polygonLayerDraw',
      type: 'fill',
      source: 'drawFeatures', // reference the data source
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: useMapSymbology.getMapSymbology().polygonDraw,
    });

    console.log('Finished adding draw layers.');
  };

  const addEditLayer = () => {
    // Clean the Layer (Remove the Source and Layer)
    if (mapRef.current.getSource('editFeatureVertex')) {
        if (mapRef.current.getLayer('pointLayerEdit')) mapRef.current.removeLayer('pointLayerEdit');
      mapRef.current.removeSource('editFeatureVertex');
    }

    console.log('Adding edit layer ...', props.editFeatureVertex);

    // Add Source: Edit Feature Vertex
    mapRef.current.addSource('editFeatureVertex', {
      type: 'geojson',
      data: turf.featureCollection(props.editFeatureVertex),
    });

    // Add Layer
    mapRef.current.addLayer({
      id: 'pointLayerEdit',
      type: 'circle',
      source: 'editFeatureVertex', // reference the data source
      filter: ['==', ['geometry-type'], 'Point'],
      paint: useMapSymbology.getMapSymbology().pointEdit,
    });

    console.log('Finished adding edit layer.');
  };

  const addLayers = () => {
    console.log('Loading layers...');

    addCustomMapsLayers();
    addFeaturesLayers();
    addFeaturesLayersSelected();
    addDrawLayers();
    addEditLayer();

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
