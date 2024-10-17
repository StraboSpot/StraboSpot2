import {PixelRatio, Platform} from 'react-native';

import * as turf from '@turf/turf';
import proj4 from 'proj4';
import {useSelector} from 'react-redux';

import {GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION} from './maps.constants';
import useServerRequests from '../../services/useServerRequests';
import {isEmpty} from '../../shared/Helpers';
import {STRABO_APIS} from '../../services/urls.constants';

const useMapCoords = () => {
  const customDatabaseEndpoint = useSelector(state => state.connections.databaseEndpoint);
  const isOnline = useSelector(state => state.connections.isOnline);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const {getMyMapsBbox} = useServerRequests();

  // Convert WGS84 to x,y pixels, assuming x,y are web mercator, or vice versa
  const convertCoords = (feature, fromProjection, toProjection) => {
    if (feature.geometry.type === 'Point') {
      feature.geometry.coordinates = proj4(fromProjection, toProjection, feature.geometry.coordinates);
    }
    else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiPoint') {
      feature.geometry.coordinates = feature.geometry.coordinates.map(
        pointCoords => proj4(fromProjection, toProjection, pointCoords));
    }
    else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiLineString') {
      feature.geometry.coordinates = feature.geometry.coordinates.map(
        lineCoords => lineCoords.map(pointCoords => proj4(fromProjection, toProjection, pointCoords)));
    }
    else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates = feature.geometry.coordinates.map(polygonCoords => polygonCoords.map(
        lineCoords => lineCoords.map(pointCoords => proj4(fromProjection, toProjection, pointCoords))));
    }
    // Interbedded (Geometry Collections)
    else if (feature.geometry.type === 'GeometryCollection') {
      feature.geometry.geometries = feature.geometry.geometries.map((geometry) => {
        return {
          type: geometry.type,
          coordinates: geometry.coordinates.map(
            lineCoords => lineCoords.map(pointCoords => proj4(fromProjection, toProjection, pointCoords))),
        };
      });
    }
    return feature;
  };

  // Convert WGS84 to image x,y pixels, assuming x,y are web mercator
  const convertFeatureGeometryToImagePixels = (feature) => {
    return convertCoords(feature, GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION);
  };

  // Convert image x,y pixels to WGS84, assuming x,y are web mercator
  const convertImagePixelsToLatLong = (feature) => {
    return convertCoords(feature, PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION);
  };

  // Get a pixel bounding box with padding around a point pressed on screen
  const getBBoxPaddedInPixels = ([x, y]) => {
    const pixelRatio = PixelRatio.get();
    const r = 15;  // padding
    const maxX = x + r;
    const minX = x - r;
    const maxY = y + r;
    const minY = y - r;
    return Platform.OS === 'web' ? [[minX, minY], [maxX, maxY]]
      : Platform.OS === 'android' ? [maxY * pixelRatio, maxX * pixelRatio, minY * pixelRatio, minX * pixelRatio]
        : [maxY, maxX, minY, minX];  // [top, right, bottom, left]
  };

  // Get geographic bounds with padding around a point
  const getBoundsPadded = ([x, y]) => {
    const r = 0.01;  // padding
    const maxX = x + r;
    const minX = x - r;
    const maxY = y + r;
    const minY = y - r;
    return [maxY, maxX, minY, minX]; // [top, right, bottom, left]
  };

  const getCentroidOfSelectedSpot = () => {
    return turf.getCoord(turf.centroid(selectedSpot));
  };

  // Identify the coordinate span for the image basemap adjusted by the given [x,y] (adjustment used for strat sections)
  const getCoordQuad = (imageBasemapProps, altOrigin) => {
    if (!imageBasemapProps || !imageBasemapProps.width || !imageBasemapProps.height) return undefined;
    // identify the [lat,lng] corners of the image basemap
    const x = altOrigin && altOrigin.x || 0;
    const y = altOrigin && altOrigin.y || 0;
    const bottomLeft = altOrigin ? proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION, [x, y]) : [x, y];
    const bottomRight = proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION, [imageBasemapProps.width + x, y]);
    const topRight = proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION,
      [imageBasemapProps.width + x, imageBasemapProps.height + y]);
    const topLeft = proj4(PIXEL_PROJECTION, GEO_LAT_LNG_PROJECTION, [x, imageBasemapProps.height + y]);
    let coordQuad = [topLeft, topRight, bottomRight, bottomLeft];
    console.log('The coordinates identified for image-basemap :', coordQuad);
    return coordQuad;
  };

  const getMyMapsBboxCoords = async (map) => {
    let myMapsBboxUrl = STRABO_APIS.MY_MAPS_BBOX;
    if (isOnline.isInternetReachable && !map.bbox && map.source === 'strabospot_mymaps') {
      if (customDatabaseEndpoint.isSelected) {
        console.log(customDatabaseEndpoint.url.replace('/db', '/geotiff/bbox/' + map.id));
        myMapsBboxUrl = customDatabaseEndpoint.url.replace('/db', '/geotiff/bbox/' + map.id);
      }
      const myMapsBbox = await useServerRequests.getMyMapsBbox(myMapsBboxUrl + map.id);
      if (!isEmpty(myMapsBbox)) return myMapsBbox.data.bbox;
    }
  };

  return {
    convertFeatureGeometryToImagePixels: convertFeatureGeometryToImagePixels,
    convertImagePixelsToLatLong: convertImagePixelsToLatLong,
    getBBoxPaddedInPixels: getBBoxPaddedInPixels,
    getBoundsPadded: getBoundsPadded,
    getCentroidOfSelectedSpot: getCentroidOfSelectedSpot,
    getCoordQuad: getCoordQuad,
    getMyMapsBboxCoords: getMyMapsBboxCoords,
  };
};

export default useMapCoords;
