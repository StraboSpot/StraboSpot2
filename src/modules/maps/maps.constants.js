import {Dimensions} from 'react-native';

import {MAPBOX_KEY} from '../../MapboxConfig';

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
export const LATITUDE = 39.828175;       // Geographic center of US;
export const LONGITUDE = -98.5795;      // Geographic center of US;
export const LATITUDE_DELTA = 0.0922;
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
export const GEO_LAT_LNG_PROJECTION = 'EPSG:4326';
export const PIXEL_PROJECTION = 'EPSG:3857';

export const MAP_MODES = {
  VIEW: 'view',
  DRAW: {
    POINT: 'point',
    LINE: 'line',
    POLYGON: 'polygon',
    FREEHANDPOLYGON: 'freehandpolygon',
    FREEHANDLINE: 'freehandline',
    POINTLOCATION: 'pointLocation',
    MEASURE: 'measure',
  },
  EDIT: 'edit',
};

export const DEFAULT_MAPS = [
  {
    title: 'Mapbox Topo',
    id: 'mapbox.outdoors',
    source: 'strabo_spot_mapbox',
  }, {
    title: 'Mapbox Satellite',
    id: 'mapbox.satellite',
    source: 'strabo_spot_mapbox',
  }, {
    title: 'OSM Streets',
    id: 'osm',
    source: 'osm',
  }, {
    title: 'Geology from Macrostrat',
    id: 'macrostrat',
    source: 'macrostrat',
  }];

export const CUSTOM_MAP_TYPES = [
  {
    title: 'Mapbox Styles',
    id: 'mapbox.styles',
    source: 'mapbox_styles',
  },
  {
    title: 'Map Warper',
    id: 'map.warper',
    source: 'map_warper',
  },
  {
    title: 'Strabospot My Maps',
    id: 'strabospot.mymaps',
    source: 'strabospot_mymaps',
  },
];

export const MAP_PROVIDERS = {
  mapbox_classic: {
    attributions: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',
    imageType: 'png',
    mime: 'image/png',
    tilePath: '/{z}/{x}/{y}.png',
    url: ['https://api.mapbox.com/v4/'],
  },
  mapbox_styles: {
    attributions: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',
    mime: 'image/png',
    tilePath: '/tiles/256/{z}/{x}/{y}',
    url: ['https://api.mapbox.com/styles/v1/'],
    // maxZoom: 20,
  },
  osm: {
    attributions: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',
    imageType: 'png',
    mime: 'image/png',
    tilePath: '{z}/{x}/{y}.png',
    url: [
      'https://a.tile.openstreetmap.org/',
      'https://b.tile.openstreetmap.org/',
      'https://c.tile.openstreetmap.org/',
    ],
    // maxZoom: 20,                  // http://wiki.openstreetmap.org/wiki/Zoom_levels
  },
  macrostrat: {
    attributions: '© <a href="https://macrostrat.org/#about">Macrostrat</a>',
    imageType: 'png',
    mime: 'image/png',
    tilePath: '/{z}/{x}/{y}.png',
    url: ['http://tiles.strabospot.org/v5/'],
  },
  map_warper: {
    attributions: '© <a href="http://mapwarper.net/home/about">Map Warper</a>',
    imageType: 'png',
    mime: 'image/png',
    tilePath: '{z}/{x}/{y}.png',
    url: ['https://www.strabospot.org/mwproxy/'],
  },
  strabo_spot_mapbox: {
    attributions: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',
    imageType: 'png',
    mime: 'image/png',
    tilePath: '/{z}/{x}/{y}.png',
    url: ['http://tiles.strabospot.org/v5/'],
    // maxZoom: 19,                   // https://www.mapbox.com/help/define-mapbox-satellite/
  },
  strabospot_mymaps: {
    attributions: '<a href="https://www.strabospot.org">StraboSpot Contributed</a>',
    imageType: 'png',
    mime: 'image/png',
    tilePath: '{z}/{x}/{y}.png',
    url: ['https://strabospot.org/geotiff/tiles/'],
    maxZoom: 25,
  },
};

export const BASEMAPS = DEFAULT_MAPS.map(map => {
  const tileUrl = map.source === 'osm' ? MAP_PROVIDERS[map.source].url[0] + MAP_PROVIDERS[map.source].tilePath
    : MAP_PROVIDERS[map.source].url[0] + map.id + MAP_PROVIDERS[map.source].tilePath;
  map.version = 8;
  map.sources = {
    [map.id]: {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
      attribution: MAP_PROVIDERS[map.source].attributions,
    },
  };
  map.glyphs = 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf';
  map.layers = [{
    id: map.id,
    type: 'raster',
    source: map.id,
    minzoom: 0,
    maxzoom: MAP_PROVIDERS[map.source].maxZoom,
  }];
  return map;
});
console.log('BASEMAPS', BASEMAPS);

export const MAP_SYMBOLS = {
  'default_point': require('../../assets/symbols/point.png'),

  // Planar Feature Symbols
  'bedding_horizontal': require('../../assets/symbols/bedding_horizontal.png'),
  'bedding_inclined': require('../../assets/symbols/bedding_inclined.png'),
  'bedding_overturned': require('../../assets/symbols/bedding_overturned.png'),
  'bedding_vertical': require('../../assets/symbols/bedding_vertical.png'),
  'contact_inclined': require('../../assets/symbols/contact_inclined.png'),
  'contact_vertical': require('../../assets/symbols/contact_vertical.png'),
  'fault': require('../../assets/symbols/fault.png'),
  'foliation_horizontal': require('../../assets/symbols/foliation_horizontal.png'),
  'foliation_inclined': require('../../assets/symbols/foliation_general_inclined.png'),
  'foliation_vertical': require('../../assets/symbols/foliation_general_vertical.png'),
  'fracture': require('../../assets/symbols/fracture.png'),
  'shear_zone_inclined': require('../../assets/symbols/shear_zone_inclined.png'),
  'shear_zone_vertical': require('../../assets/symbols/shear_zone_vertical.png'),
  'vein': require('../../assets/symbols/vein.png'),

  // Old
  // 'axial_planar_inclined': require('../../assets/symbols/cleavage_inclined.png'),
  // 'axial_planar_vertical': require('../../assets/symbols/cleavage_vertical.png'),
  // 'joint_inclined': require('../../assets/symbols/joint_surface_inclined.png'),
  // 'joint_vertical': require('../../assets/symbols/joint_surface_vertical.png'),
  // 'shear_fracture': require('../../assets/symbols/shear_fracture.png'),

  // Linear Feature Symbols
  // 'fault': require('../../assets/symbols/fault_striation.png'),
  // 'flow': require('../../assets/symbols/flow.png'),
  // 'fold_hinge': require('../../assets/symbols/fold_axis.png'),
  // 'intersection': require('../../assets/symbols/intersection.png'),
  'lineation_general': require('../../assets/symbols/lineation_general.png'),
};
