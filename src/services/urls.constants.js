const account = '/account';
const straboSpotAPI = 'https://strabospot.org';
const tilehost = 'https://tiles.strabospot.org';

// StraboField
const straboDB = straboSpotAPI + '/db';

// Images
const straboImage = straboSpotAPI + '/db/image/';
const straboProfileImage = straboSpotAPI + '/profileimage/';
const straboPublicImage = straboSpotAPI + '/pi/';
const straboPublicImageResized = straboSpotAPI + '/pi_basemap/';
const straboPublicImageThumbnail = straboSpotAPI + '/pi_thumbnail/';

// Maps
const myMapsGeotiff = straboSpotAPI + '/geotiff';
const myMapsBbox = myMapsGeotiff + '/bbox/';
const myMapsCheck = straboSpotAPI + '/strabo_mymaps_check/';
const myMapsTiles = myMapsGeotiff + '/tiles/';
const tileCount = tilehost + '/zipcount';

export const STRABO_APIS = {
  ACCOUNT: account,
  DB: straboDB,
  IMAGE: straboImage,
  MY_MAPS_BBOX: myMapsBbox,
  MY_MAPS_CHECK: myMapsCheck,
  MY_MAPS_TILES: myMapsTiles,
  PROFILE_IMAGE: straboProfileImage,
  PUBLIC_IMAGE: straboPublicImage,
  PUBLIC_IMAGE_RESIZED: straboPublicImageResized,
  PUBLIC_IMAGE_THUMBNAIL: straboPublicImageThumbnail,
  STRABO: straboSpotAPI,
  TILE_COUNT: tileCount,
  TILE_HOST: tilehost,
};

// StraboMicro
const microDB = '/microdb';

export const MICRO_PATHS = {
  MY_PROJECTS: microDB + '/myProjects',
  PDF_PROJECT: microDB + '/projectPDF',
  WEB_PROJECT: microDB + '/webProject',
};
