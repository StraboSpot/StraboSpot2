import React, {useEffect, useState, useRef} from 'react';
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

mapboxgl.accessToken = config.get('mapbox_access_token');

const Basemap = (props) => {
  const center = useSelector(state => state.map.center || [LONGITUDE, LATITUDE]);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const zoom = useSelector(state => state.map.zoom || ZOOM);

  const {mapRef, cameraRef} = props.forwardedRef;

  const [initialCenter, setInitialCenter] = useState(center);
  const [initialZoom, setInitialZoom] = useState(zoom);

  const mapContainer = useRef(null);

  useEffect(() => {
      console.log('UE Basemap - Initializing Basemap', mapRef, props.basemap);
      setInitialCenter(getCenterCoordinates());
      setInitialZoom(getZoomLevel());
      if (mapRef.current) return; // initialize map only once
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        // style: !props.imageBasemap && !props.stratSection && props.basemap,
        center: center,
        zoom: zoom
      });
    }, [],
  );

  useEffect(() => {
    console.log('UE Basemap - Changed props.basemap', props.basemap);
    mapRef.current.setStyle(props.basemap);
  }, [props.basemap]);

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
}

  export const MapLayer = React.forwardRef((props, ref) => (
    <Basemap {...props} forwardedRef={ref}/>
  ));
  MapLayer.displayName = 'MapLayer';
