import {Platform} from 'react-native';

import RNFS from 'react-native-fs';
import {useDispatch} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import {deletedOfflineMap} from '../modules/maps/maps.slice';

import {doesBackupDirectoryExist} from '../modules/project/projects.slice';


const useDevice = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';
  const appDirectory = '/StraboSpot';
  const imagesDirectory = appDirectory + '/Images';
  const tilesDirectory = '/StraboSpotTiles';
  const tileCacheDirectory = devicePath + tilesDirectory + '/TileCache';
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
    console.log(`Deleted ${map.name} offlineMap from device.`);
  };

  const doesDeviceDirectoryExist = async (directory) => {
    try {
      const checkDirSuccess = await RNFetchBlob.fs.isDir(directory);
      if (checkDirSuccess) {
        console.log('Directory', directory, 'exists.', checkDirSuccess);
      }
      else {
        // If directory does not exist then one is created
        return RNFetchBlob.fs.mkdir(directory)
          .then(checkDirectorySuccess => {
            console.log('Directory:', directory, 'CREATED!');
            return checkDirectorySuccess;
          })
          .catch(createDirError => {
            console.error('Unable to create directory', directory, 'ERROR:', createDirError);
            throw Error;
          });
      }
      console.log(checkDirSuccess);
      return checkDirSuccess;
    }
    catch (err) {
      console.error('Error in doesDeviceDirectoryExist()', err);
      throw Error;
    }
  };

  const doesDeviceFileExist = async (id, extension) => {
    const imageExists = await RNFetchBlob.fs.exists(devicePath + imagesDirectory + '/' + id + extension);
    console.log('Image Exists:', imageExists);
    return imageExists;
  };

  const doesDeviceBackupDirExist = async (subDirectory) => {
    if (subDirectory !== undefined) {
      return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups + '/' + subDirectory);
    }
    else {
      const exists = await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups);
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
    writeFileToDevice: writeFileToDevice,
  };
};

export default useDevice;
