import {Linking} from 'react-native';

import RNFS from 'react-native-fs';
import {useDispatch} from 'react-redux';

import {deletedOfflineMap} from '../modules/maps/offline-maps/offlineMaps.slice';
import {doesBackupDirectoryExist} from '../modules/project/projects.slice';
import {APP_DIRECTORIES} from './deviceAndAPI.constants';


const useDevice = () => {
  const dispatch = useDispatch();

  const copyFiles = async (source, target) => {
    try {
      await RNFS.copyFile(source, target);
    }
    catch (err) {
      console.error('Error Copying Image Files to Backup');
      throw Error(err);
    }
  };

  const createProjectDirectories = async () => {
    await RNFS.mkdir(APP_DIRECTORIES.APP_DIR);
    console.log('App Directory Created');
    await RNFS.mkdir(APP_DIRECTORIES.BACKUP_DIR);
    console.log('Backup Directory Created');
    await RNFS.mkdir(APP_DIRECTORIES.TILES_DIRECTORY);
    console.log('Tiles Directory Created');
    await RNFS.mkdir(APP_DIRECTORIES.TILE_CACHE);
    console.log('Tile Cache Directory Created');
  };

  const createAppDirectory = (directory) => {
    return RNFS.mkdir(directory)
      .then(() => {
        console.log('Directory:', directory, 'CREATED!');
        return true;
      })
      .catch((err) => {
        console.error('Unable to create directory', directory, 'ERROR:', err);
        throw Error(err);
      });
  };

  const deleteOfflineMap = async (map) => {
    let mapID = map.id;
    console.log(`Deleting Map, ${map.name}, with ID of ${map.id} Here`);
    mapID === 'mapwarper' ? map.name : map.id;
    map.source === 'mapbox_styles' && mapID.includes('/') ? mapID = mapID.split('/')[1] : mapID;

    const cacheFolderExists = await RNFS.exists(APP_DIRECTORIES.TILE_CACHE + mapID);
    const zipFileExists = await RNFS.exists(APP_DIRECTORIES.TILE_ZIP + map.mapId + '.zip');
    const tileTempFileExists = await RNFS.exists(APP_DIRECTORIES.TILE_TEMP + '/' + map.mapId);
    console.log(cacheFolderExists, zipFileExists, tileTempFileExists);
    //first, delete folder with tiles
    if (cacheFolderExists) await RNFS.unlink(APP_DIRECTORIES.TILE_CACHE + mapID);
    // Deleting supporting folders
    if (zipFileExists) await RNFS.unlink(APP_DIRECTORIES.TILE_ZIP + map.mapId + '.zip');
    if (tileTempFileExists) await RNFS.unlink(APP_DIRECTORIES.TILE_TEMP + map.mapId);
    dispatch(deletedOfflineMap(map.id));
    console.log(`Deleted ${map.name} offline map from device.`);
  };

  const deleteProjectOnDevice = (file) => {
    try {
      console.log(file);
      RNFS.unlink(APP_DIRECTORIES.BACKUP_DIR + file).then(
        () => console.log(`Deleted ${file}`),
      );
      return 'Deleted';
    }
    catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const doesDeviceDirectoryExist = async (directory) => {
    try {
      let checkDirSuccess = await RNFS.exists(directory);
      console.log(checkDirSuccess);
      if (checkDirSuccess) console.log('Directory', directory, 'exists.', checkDirSuccess);
      // If directory does not exist then one is created
      else checkDirSuccess = await createAppDirectory(directory);
      console.log(checkDirSuccess);
      return checkDirSuccess;
    }
    catch (err) {
      console.error('Error in doesDeviceDirectoryExist()', err);
      throw Error(err);
    }
  };

  const doesDeviceFileExist = async (id, extension) => {
    const imageExists = await RNFS.exists(APP_DIRECTORIES.IMAGES + id + extension);
    console.log('Image Exists:', imageExists);
    return imageExists;
  };

  const doesDeviceBackupDirExist = async (subDirectory) => {
    if (subDirectory !== undefined) return await RNFS.exists(APP_DIRECTORIES.BACKUP_DIR + subDirectory);
    else {
      const exists = await RNFS.exists(APP_DIRECTORIES.BACKUP_DIR);
      dispatch(doesBackupDirectoryExist(exists));
      return exists;
    }
  };

  const openURL = async (url) => {
    console.log(url + APP_DIRECTORIES.BACKUP_DIR);
    try {
      if (url === 'ProjectBackups') {
        url = APP_DIRECTORIES.SHARED_DOCUMENTS_PATH_IOS + APP_DIRECTORIES.BACKUP_DIR + url;
      }
      const initialUrl = await Linking.canOpenURL(url);
      console.log(initialUrl);
      if (initialUrl) Linking.openURL(url).catch(err => console.error('ERROR', err));
      else console.log('Could not open:', url);
    }
    catch (err) {
      console.error('Error opening url', url, ':', err);
    }
  };

  const makeDirectory = (directory) => {
    return RNFS.mkdir(directory)
      .then(() => 'DIRECTORY HAS BEEN CREATED')
      .catch((err) => {
        console.error('Unable to create directory', directory, 'ERROR:', err);
        throw Error;
      });
  };

  const readDirectoryForMapTiles = async (mapId) => {
    try {
      let tiles = [];
      mapId = mapId.includes('/') ? mapId.split('/')[1] : mapId;
      const exists = await RNFS.exists(APP_DIRECTORIES.TILE_CACHE + mapId + '/tiles');
      console.log('Map tiles cache tiles directory:', exists);
      if (exists) {
        tiles = await RNFS.readdir(APP_DIRECTORIES.TILE_CACHE + mapId + '/tiles');
        // console.log('Tiles', tiles);
      }
      return tiles;
    }
    catch (err) {
      console.error('Error reading map tile directory', err);
    }
  };

  const readDirectoryForMapFiles = async () => {
    const exists = await RNFS.exists(APP_DIRECTORIES.TILES_DIRECTORY);
    console.log('Offline maps directory exists? ', exists);
    if (exists) {
      const files = await RNFS.readdir(APP_DIRECTORIES.TILE_CACHE);
      console.log(files);
      return files;
    }
    else throw Error('Offline maps directory does not exist!');
  };

  const writeFileToDevice = async (path, filename, data) => {
    try {
      console.log('Write Started');
      await RNFS.writeFile(path + '/' + filename, JSON.stringify(data), 'utf8');
      console.log('FILES WRITTEN SUCCESSFULLY TO INTERNAL STORAGE!');
      console.log(path + '/' + filename);
    }
    catch (err) {
      console.error('Write Error!', err.message);
    }
  };

  return {
    copyFiles: copyFiles,
    createProjectDirectories: createProjectDirectories,
    deleteOfflineMap: deleteOfflineMap,
    deleteProjectOnDevice: deleteProjectOnDevice,
    doesDeviceBackupDirExist: doesDeviceBackupDirExist,
    doesDeviceDirectoryExist: doesDeviceDirectoryExist,
    doesDeviceFileExist: doesDeviceFileExist,
    openURL: openURL,
    makeDirectory: makeDirectory,
    readDirectoryForMapTiles: readDirectoryForMapTiles,
    readDirectoryForMapFiles: readDirectoryForMapFiles,
    writeFileToDevice: writeFileToDevice,
  };
};

export default useDevice;
