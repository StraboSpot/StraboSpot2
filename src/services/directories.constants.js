import RNFS from 'react-native-fs';

const devicePath = RNFS.DocumentDirectoryPath;
// const androidBackupPath = RNFS.ExternalStorageDirectoryPath; //Android Only

// const appDirectoryForDistributedBackups = Platform.OS === 'ios' ? devicePath + /ProjectBackups/ : androidBackupPath + '/StraboSpot2/ProjectBackups/';
const appDirectoryForDistributedBackups = devicePath + '/ProjectBackups/';
const appDirectory = devicePath + '/StraboSpot';
const sharedDocumentsPathIOS = 'shareddocuments://'; // To access Files.app on iOS
const imagesDirectory = appDirectory + '/Images/';
const tilesDirectory = devicePath + '/StraboSpotTiles';
const tileCacheDirectory = tilesDirectory + '/TileCache/';
const tileTempDirectory = tilesDirectory + '/TileTemp/';
const zipsDirectory = tilesDirectory + '/TileZips/';

export const APP_DIRECTORIES = {
  ROOT_PATH: devicePath,
  APP_DIR: appDirectory,
  BACKUP_DIR: appDirectoryForDistributedBackups,
  SHARED_DOCUMENTS_PATH_IOS: sharedDocumentsPathIOS,
  IMAGES: imagesDirectory,
  TILE_CACHE: tileCacheDirectory,
  TILES_DIRECTORY: tilesDirectory,
  TILE_TEMP: tileTempDirectory,
  TILE_ZIP: zipsDirectory,
};

