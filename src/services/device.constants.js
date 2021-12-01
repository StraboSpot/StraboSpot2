import RNFS from 'react-native-fs';

const devicePath = RNFS.DocumentDirectoryPath;
const appDirectoryForDistributedBackups = devicePath + '/ProjectBackups/';
const appDirectory = devicePath + '/StraboSpot';
const sharedDocumentsPathIOS = 'shareddocuments://'; // To access Files.app on iOS
const imagesDirectory = appDirectory + '/Images/';
const tilesDirectory = devicePath + '/StraboSpotTiles';
const tileCacheDirectory = tilesDirectory + '/TileCache/';
const tilehost = 'http://tiles.strabospot.org';
const tileTempDirectory = tilesDirectory + '/TileTemp/';
const zipsDirectory = tilesDirectory + '/TileZips/';

export const APP_DIRECTORIES = {
  ROOT_PATH: devicePath,
  APP_DIR: appDirectory,
  BACKUP_DIR:  appDirectoryForDistributedBackups,
  SHARED_DOCUMENTS_PATH_IOS: sharedDocumentsPathIOS,
  IMAGES: devicePath + imagesDirectory,
  TILE_CACHE: tileCacheDirectory,
  TILES_DIRECTORY: tilesDirectory,
  TILE_HOST: tilehost,
  TILE_TEMP: tileTempDirectory,
  TILE_ZIP: zipsDirectory,
};
