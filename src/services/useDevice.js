import {Platform} from 'react-native';

import RNFS from 'react-native-fs';
import {useDispatch} from 'react-redux';

import {deletedOfflineMap, setOfflineMap} from '../modules/maps/offline-maps/offlineMaps.slice';
import {doesBackupDirectoryExist} from '../modules/project/projects.slice';


const useDevice = () => {
  const devicePath = RNFS.DocumentDirectoryPath;
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';
  const appDirectory = '/StraboSpot';
  const imagesDirectory = appDirectory + '/Images';
  const tilesDirectory = devicePath + '/StraboSpotTiles';
  const tileCacheDirectory = tilesDirectory  + '/TileCache';
  const tileTempDirectory = devicePath + tilesDirectory + '/TileTemp';
  const zipsDirectory = devicePath + tilesDirectory + '/TileZips';

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

  const deleteOfflineMap = async (map) => {
    console.log('Deleting Map Here');
    console.log('map: ', map.id);
    // console.log('directory: ', tileCacheDirectory + '/' + map.id);
    const mapId = map.id === 'mapwarper' ? map.name : map.id;
    let folderExists = await RNFS.exists(tileCacheDirectory + '/' + mapId);
    const zipFileExists = await RNFS.exists(
      zipsDirectory + '/' + map.mapId + '.zip',
    );
    const tileTempFileExists = await RNFS.exists(
      tileTempDirectory + '/' + map.mapId,
    );
    console.log(folderExists, zipFileExists, tileTempFileExists);
    //first, delete folder with tiles
    if (folderExists || zipFileExists || tileTempFileExists) {
      await RNFS.unlink(tileCacheDirectory + '/' + mapId);
      if (zipFileExists) {
        await RNFS.unlink(zipsDirectory + '/' + map.mapId + '.zip');
      }
      if (tileTempFileExists) {
        await RNFS.unlink(tileTempDirectory + '/' + map.mapId);
      }
    }
    dispatch(deletedOfflineMap(map.id));
    console.log(`Deleted ${map.name} offline map from device.`);
  };

  const doesDeviceDirectoryExist = async (directory) => {
    try {
      const checkDirSuccess = await RNFS.exists(directory);
      if (checkDirSuccess) {
        console.log('Directory', directory, 'exists.', checkDirSuccess);
      }
      else {
        // If directory does not exist then one is created
        return RNFS.mkdir(directory)
          .then(() => {
            console.log('Directory:', directory, 'CREATED!');
            return true;
          })
          .catch(err => {
            console.error('Unable to create directory', directory, 'ERROR:', err);
            throw Error(err);
          });
      }
      console.log(checkDirSuccess);
      return checkDirSuccess;
    }
    catch (err) {
      console.error('Error in doesDeviceDirectoryExist()', err);
      throw Error(err);
    }
  };

  const doesDeviceFileExist = async (id, extension) => {
    const imageExists = await RNFS.exists(devicePath + imagesDirectory + '/' + id + extension);
    console.log('Image Exists:', imageExists);
    return imageExists;
  };

  const doesDeviceBackupDirExist = async (subDirectory) => {
    if (subDirectory !== undefined) {
      return await RNFS.exists(devicePath + appDirectoryForDistributedBackups + '/' + subDirectory);
    }
    else {
      const exists = await RNFS.exists(devicePath + appDirectoryForDistributedBackups);
      dispatch(doesBackupDirectoryExist(exists));
      return exists;
    }
  };

  const makeDirectory = (directory) => {
    return RNFS.mkdir(devicePath + directory)
      .then(() => 'DIRECTORY HAS BEEN CREATED')
      .catch(err => {
        console.error('Unable to create directory', directory, 'ERROR:', err);
        throw Error;
      });
  };

  const readDirectoryForMapTiles = async (mapId) => {
    try {
      let tiles = [];
      const exists = await RNFS.exists(tileCacheDirectory + '/' + mapId + '/tiles');
      console.log('Map Tiles Dir Exists:', exists);
      if (exists) {
        tiles = await RNFS.readdir(tileCacheDirectory + '/' + mapId + '/tiles');
        // console.log('Tiles', tiles);
      }
      return tiles;
    }
    catch (err) {
      console.error('Error reading map tile directory', err);
    }
  };

  const readDirectoryForMaps = async () => {
    try {
      const exists = await RNFS.exists(tilesDirectory);
      console.log(exists)
      if (exists) {
        const files = await RNFS.readdir(tileCacheDirectory);
        console.log(files);
        return files;
      }
    }
    catch (err) {
      console.error('Error reading directory for maps', err);
      dispatch(setOfflineMap({}));
      throw Error(err);
    }
  };

  const writeFileToDevice = (path, filename, data) => {
    return RNFS.writeFile(path + '/' + filename, JSON.stringify(data), 'utf8')
      .then(() => 'FILES WRITTEN SUCCESSFULLY!')
      .catch(err => console.error('Write Error!', err.message));
  };

  return {
    copyFiles: copyFiles,
    deleteOfflineMap: deleteOfflineMap,
    doesDeviceBackupDirExist: doesDeviceBackupDirExist,
    doesDeviceDirectoryExist: doesDeviceDirectoryExist,
    doesDeviceFileExist: doesDeviceFileExist,
    makeDirectory: makeDirectory,
    readDirectoryForMapTiles: readDirectoryForMapTiles,
    readDirectoryForMaps: readDirectoryForMaps,
    writeFileToDevice: writeFileToDevice,
  };
};

export default useDevice;
