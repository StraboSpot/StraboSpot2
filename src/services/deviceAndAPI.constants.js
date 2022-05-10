import RNFS from 'react-native-fs';

const devicePath = RNFS.DocumentDirectoryPath;
const appDirectoryForDistributedBackups = devicePath + '/ProjectBackups/';
const appDirectory = devicePath + '/StraboSpot';
const sharedDocumentsPathIOS = 'shareddocuments://'; // To access Files.app on iOS
const imagesDirectory = appDirectory + '/Images/';
const tilesDirectory = devicePath + '/StraboSpotTiles';
const tileCacheDirectory = tilesDirectory + '/TileCache/';
const tileTempDirectory = tilesDirectory + '/TileTemp/';
const zipsDirectory = tilesDirectory + '/TileZips/';

const straboSpotAPI = 'https://strabospot.org';
const tilehost = 'https://tiles.strabospot.org';
const straboDB = straboSpotAPI + '/db';
const myMapsGeotiff = straboSpotAPI + '/geotiff';
const myMapsBbox = myMapsGeotiff + '/bbox/';
const myMapsTiles = myMapsGeotiff + '/tiles/';
const myMapsCheck = straboSpotAPI + '/strabo_mymaps_check/';
const tileCount = tilehost + '/zipcount';

export const APP_DIRECTORIES = {
  ROOT_PATH: devicePath,
  APP_DIR: appDirectory,
  BACKUP_DIR:  appDirectoryForDistributedBackups,
  SHARED_DOCUMENTS_PATH_IOS: sharedDocumentsPathIOS,
  IMAGES: imagesDirectory,
  TILE_CACHE: tileCacheDirectory,
  TILES_DIRECTORY: tilesDirectory,
  TILE_TEMP: tileTempDirectory,
  TILE_ZIP: zipsDirectory,
};

export const STRABO_APIS = {
  STRABO: straboSpotAPI,
  TILE_HOST: tilehost,
  DB: straboDB,
  MY_MAPS_BBOX: myMapsBbox,
  MY_MAPS_TILES: myMapsTiles,
  MY_MAPS_CHECK: myMapsCheck,
  TILE_COUNT: tileCount,
};
