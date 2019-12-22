import {Dimensions} from 'react-native';
import {MAPBOX_KEY} from '../../MapboxConfig';

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
export const LATITUDE = 39.828175;       // Geographic center of US;
export const LONGITUDE = -98.5795;      // Geographic center of US;
export const LATITUDE_DELTA = 0.0922;
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export const MapModes = {
  VIEW: 'view',
  DRAW: {
    POINT: 'point',
    LINE: 'line',
    POLYGON: 'polygon',
  },
  EDIT: 'edit',
};

export const mapReducers = {
  CURRENT_BASEMAP: 'CURRENT_BASEMAP',
  CUSTOM_MAPS: 'CUSTOM_MAPS',
  DELETE_OFFLINE_MAP: 'DELETE_OFFLINE_MAP',
  OFFLINE_MAPS: 'OFFLINE_MAPS',
  VERTEX_START_COORDS: 'VERTEX_START_COORDS',
  VERTEX_END_COORDS: 'VERTEX_END_COORDS',
  CLEAR_VERTEXES: 'CLEAR_VERTEXES',
};

export const basemaps = {
  osm: {
    id: 'osm',
    layerId: 'osmLayer',
    layerLabel: 'OSM Streets',
    layerSaveId: 'osm',
    url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 16,
  },
  macrostrat: {
    id: 'macrostrat',
    layerId: 'macrostratLayer',
    layerLabel: 'Geology from Macrostrat',
    layerSaveId: 'macrostrat',
    url: 'http://tiles.strabospot.org/v5/macrostrat/{z}/{x}/{y}.png',
    maxZoom: 19,
  },
  mapboxOutdoors: {
    id: 'mapboxOutdoors',
    layerId: 'mapboxOutdoorsLayer',
    layerLabel: 'Mapbox Topo',
    layerSaveId: 'mapbox.outdoors',
    url: 'http://tiles.strabospot.org/v5/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
    maxZoom: 19,
  },
  mapboxSatellite: {
    id: 'mapboxSatellite',
    layerId: 'mapboxSatelliteLayer',
    layerLabel: 'Mapbox Satellite',
    layerSaveId: 'mapbox.satellite',
    url: 'http://tiles.strabospot.org/v5/mapbox.satellite/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
    maxZoom: 19,
  },
};
