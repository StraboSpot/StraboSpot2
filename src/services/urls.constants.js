const account = '/account';
const straboSpotAPI = 'https://strabospot.org';
const tilehost = 'https://tiles.strabospot.org';
const straboDB = straboSpotAPI + '/db';
const straboImage = straboSpotAPI + '/db/image/';
const straboProfileImage = straboSpotAPI + '/profileimage/';
const straboPublicImage = straboSpotAPI + '/pi/';
const straboPublicImageThumbnail = straboSpotAPI + '/pi_thumbnail/';
const straboPublicImageResized = straboSpotAPI + '/pi_basemap/';
const myMapsGeotiff = straboSpotAPI + '/geotiff';
const myMapsBbox = myMapsGeotiff + '/bbox/';
const myMapsTiles = myMapsGeotiff + '/tiles/';
const myMapsCheck = straboSpotAPI + '/strabo_mymaps_check/';
const tileCount = tilehost + '/zipcount';

export const STRABO_APIS = {
  ACCOUNT: account,
  STRABO: straboSpotAPI,
  IMAGE: straboImage,
  PUBLIC_IMAGE: straboPublicImage,
  PUBLIC_IMAGE_THUMBNAIL: straboPublicImageThumbnail,
  PUBLIC_IMAGE_RESIZED: straboPublicImageResized,
  PROFILE_IMAGE: straboProfileImage,
  TILE_HOST: tilehost,
  DB: straboDB,
  MY_MAPS_BBOX: myMapsBbox,
  MY_MAPS_TILES: myMapsTiles,
  MY_MAPS_CHECK: myMapsCheck,
  TILE_COUNT: tileCount,
};
