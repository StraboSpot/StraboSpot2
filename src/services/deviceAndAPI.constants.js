import RNFS from 'react-native-fs';

const devicePath = RNFS.DocumentDirectoryPath;
const androidDownloadsPath = RNFS.DownloadDirectoryPath + '/StraboSpot2/Backups/'; //Android Only
const androidExportPath = devicePath + '/AndroidExportFiles/';
const account = '/account';
// const appDirectoryForDistributedBackups = Platform.OS === 'ios' ? devicePath + /ProjectBackups/ : androidBackupPath + '/StraboSpot2/ProjectBackups/';
const appDirectoryForBackups = devicePath + '/ProjectBackups/';
const appDirectoryForDistributedBackups = devicePath + '/Distribution/';
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
  BACKUP_DIR: appDirectoryForBackups,
  DOWNLOAD_DIR_ANDROID: androidDownloadsPath,
  EXPORT_FILES_ANDROID: androidExportPath,
  EXPORT_FILES_IOS: appDirectoryForDistributedBackups,
  SHARED_DOCUMENTS_PATH_IOS: sharedDocumentsPathIOS,
  IMAGES: imagesDirectory,
  TILE_CACHE: tileCacheDirectory,
  TILES_DIRECTORY: tilesDirectory,
  TILE_TEMP: tileTempDirectory,
  TILE_ZIP: zipsDirectory,
};

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
