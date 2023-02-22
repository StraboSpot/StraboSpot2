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

  console.log('symbols', symbols);

  useEffect(() => {
    console.log('UE Basemap', mapRef, props.basemap);
    setInitialCenter(getCenterCoordinates());
    setInitialZoom(getZoomLevel());
    if (mapRef.current) return; // initialize map only once  DOESN'T SEEM TO WORK
    if (!mapRef.current) {
      console.log('Initializing Basemap...');
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        // style: !props.imageBasemap && !props.stratSection && props.basemap,
        center: center,
        zoom: zoom,
      });
    }
    // Clean up on unmount
    return () => mapRef.current.remove();
  }, []);

  useEffect(() => {
    console.log('UE Basemap - Changed props.basemap', props.basemap);
    if (mapRef.current) mapRef.current.setStyle(props.basemap);
  }, [props.basemap]);

  useEffect(() => {
    if (mapRef.current) {
      if (!isEmpty(props.spotsNotSelected) || !isEmpty(props.spotsSelected)) {
        mapRef.current.on('load', () => {
            console.log('A load event occurred.');

            // Load an image from an external URL.
            // mapRef.current.loadImage(
            //   symbols.default_point, (error, image) => {
            //     if (error) throw error;

            // Add the image to the map style.
            // if (!mapRef.current.hasImage('point')) mapRef.current.addImage('point', image);
            // if (mapRef.current.hasImage('point')) console.log('Added Image: point');

            // Add a data source containing one point feature.
            if (mapRef.current.getSource('spotsNotSelectedSource')) {
              if (mapRef.current.getLayer('pointLayerNotSelected')) {
                mapRef.current.removeLayer('pointLayerNotSelected');
              }
              mapRef.current.removeSource('spotsNotSelectedSource');
            }
            mapRef.current.addSource('spotsNotSelectedSource', {
              type: 'geojson',
              // tolerance: 0,
              // buffer: 0,
              data: turf.featureCollection(
                useMapSymbology.addSymbology(useMaps.getSpotsAsFeatures(props.spotsNotSelected))),
            });
            if (mapRef.current.getSource('spotsNotSelectedSource')) {
              console.log('Added Source: spotsNotSelectedSource');
            }

            // Add a layer to use the image to represent the data.
            // if (mapRef.current.getLayer('points')) mapRef.current.removeLayer('points');
            mapRef.current.addLayer({
              id: 'pointLayerNotSelected',
              type: 'symbol',
              source: 'spotsNotSelectedSource', // reference the data source
              filter: ['==', ['geometry-type'], 'Point'],
              layout: {
                'icon-image': 'point', // reference the image
                'icon-size': 0.35,
                'icon-padding': 0,
                // 'symbol-spacing': 0,
                'icon-allow-overlap': true,     // Need to be able to stack symbols at same location
                'icon-ignore-placement': true,  // Need to be able to stack symbols at same location
              },
            });
            if (mapRef.current.getLayer('pointLayerNotSelected')) console.log('Added Layer: pointLayerNotSelected');
          },
        );
        // });
      }

      // Add the image to the map style.
      const loadImage = (id) => {
        mapRef.current.loadImage(
          symbols.default_point, (error, image) => {
            if (error) throw error;
            if (!mapRef.current.hasImage(id)) mapRef.current.addImage(id, image);
            if (mapRef.current.hasImage(id)) console.log('Added Image:', id);
          });
      };

      mapRef.current.on('styleimagemissing', (e) => {
        const id = e.id; // id of the missing image
        console.log(id, e);
        loadImage(id);
      });

      mapRef.current.on('render', () => {
        console.log('A render event occurred.');
      });

      mapRef.current.on('moveend', async () => {
        console.log('A moveend event occurred.');
        props.spotsInMapExtent();
        if (!props.imageBasemap && !props.stratSection && mapRef?.current) {
          const newCenter = await mapRef.current.getCenter().toArray();
          const newZoom = await mapRef.current.getZoom();
          useMapView.setMapView(newCenter, newZoom);
        }
      });
    }
  }, [props.spotsNotSelected]);

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
