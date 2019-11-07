import {Dimensions} from "react-native";

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
export const LATITUDE = 32.299329;
export const LONGITUDE = -110.867528;
export const LATITUDE_DELTA = 0.0922;
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export const MapModes = {
  VIEW: 'view',
  DRAW: {
    POINT: 'point',
    LINE: 'line',
    POLYGON: 'polygon',
  },
  EDIT: 'edit'
};

export const mapReducers = {
  CURRENT_BASEMAP: 'CURRENT_BASEMAP',
  CUSTOM_MAPS: 'CUSTOM_MAPS',
  DELETE_OFFLINE_MAP: 'DELETE_OFFLINE_MAP',
  MAP: 'MAP',
  OFFLINE_MAPS: 'OFFLINE_MAPS',
  VERTEX_SELECTED: 'VERTEX_SELECTED'
};
