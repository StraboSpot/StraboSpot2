import proj4 from 'proj4';
import {useSelector} from 'react-redux';

import {GEO_LAT_LNG_PROJECTION, PIXEL_PROJECTION} from './maps.constants';
import useServerRequestsHook from '../../services/useServerRequests';
import {isEmpty} from '../../shared/Helpers';

const useMapCoords = () => {
  const isOnline = useSelector(state => state.connections.isOnline);
  const {geometry, properties} = useSelector(state => state.spot.selectedSpot);
  const useServerRequests = useServerRequestsHook();

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

  const getCenterCoordsOfFeature = () => {
    if (geometry.type === 'Point') return geometry.coordinates;
    else if (geometry.type === 'Line') console.log('Get center cood of line')
    else if (geometry.type === 'Polygon') console.log('Get center cood of polygon')
  }

  // Identify the coordinate span for the image basemap adjusted by the given [x,y] (adjustment used for strat sections)
  const getCoordQuad = (imageBasemapProps, altOrigin) => {
    if (!imageBasemapProps) return undefined;
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
    if (isOnline.isInternetReachable && !map.bbox && map.source === 'strabospot_mymaps') {
      const myMapsBbox = await useServerRequests.getMyMapsBbox(map.id);
      if (!isEmpty(myMapsBbox)) return myMapsBbox.data.bbox;
    }
  };

  return {
    convertFeatureGeometryToImagePixels: convertFeatureGeometryToImagePixels,
    convertImagePixelsToLatLong: convertImagePixelsToLatLong,
    getCenterCoordsOfFeature: getCenterCoordsOfFeature,
    getCoordQuad: getCoordQuad,
    getMyMapsBboxCoords: getMyMapsBboxCoords,
  };
};

export default useMapCoords;
