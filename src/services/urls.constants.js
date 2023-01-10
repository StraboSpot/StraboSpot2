const account = '/account';
const straboSpotAPI = 'https://strabospot.org';
const tilehost = 'https://tiles.strabospot.org';
const straboDB = straboSpotAPI + '/db';
const myMapsGeotiff = straboSpotAPI + '/geotiff';
const myMapsBbox = myMapsGeotiff + '/bbox/';
const myMapsTiles = myMapsGeotiff + '/tiles/';
const myMapsCheck = straboSpotAPI + '/strabo_mymaps_check/';
const tileCount = tilehost + '/zipcount';

export const STRABO_APIS = {
  ACCOUNT: account,
  STRABO: straboSpotAPI,
  TILE_HOST: tilehost,
  DB: straboDB,
  MY_MAPS_BBOX: myMapsBbox,
  MY_MAPS_TILES: myMapsTiles,
  MY_MAPS_CHECK: myMapsCheck,
  TILE_COUNT: tileCount,
};
