import {Linking, PermissionsAndroid, Platform} from 'react-native';

import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {unzip} from 'react-native-zip-archive';
import {useDispatch, useSelector} from 'react-redux';

import {deletedOfflineMap} from '../modules/maps/offline-maps/offlineMaps.slice';
import {doesBackupDirectoryExist, doesDownloadsDirectoryExist} from '../modules/project/projects.slice';
import {APP_DIRECTORIES} from './directories.constants';
import {STRABO_APIS} from './urls.constants';


const useDevice = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const copyFiles = async (source, target) => {
    try {
      await RNFS.copyFile(source, target);
    }
    catch (err) {
      console.error('Error Copying Image Files to Backup', err);
      throw Error(err);
    }
  };

  const createProjectDirectories = async () => {
    await makeDirectory(APP_DIRECTORIES.APP_DIR);
    console.log('App Directory Created');
    await makeDirectory(APP_DIRECTORIES.IMAGES);
    console.log('Images Directory Created');
    await makeDirectory(APP_DIRECTORIES.BACKUP_DIR);
    console.log('Backup Directory Created');
    if (Platform.OS === 'android') {
      await makeDirectory(APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID);
      console.log('Android Downloads/StraboSpot/Backups directory created');
    }
    if (Platform.OS === 'ios') {
      await makeDirectory(APP_DIRECTORIES.EXPORT_FILES_IOS);
      console.log('Distribution directory created for iOS');
    }
    await makeDirectory(APP_DIRECTORIES.TILES_DIRECTORY);
    console.log('Tiles Directory Created');
    await makeDirectory(APP_DIRECTORIES.TILE_CACHE);
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

  const deleteFromDevice = async (dir, file) => {
    console.log(dir + file);
    const filepath = file ? dir + file : dir;
    await RNFS.unlink(filepath);
    console.log(`${file ? dir + file : dir} has been DELETED!`);
  };

  const doesBackupFileExist = (filename) => {
    const exists = RNFS.exists(APP_DIRECTORIES.BACKUP_DIR + filename + '/data.json');
    return exists;
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

  const doesDeviceDirExist = async (dir) => {
    return await RNFS.exists(dir);
  };

  const doesDeviceBackupDirExist = async (subDirectory, isExternal) => {
    if (isExternal && Platform.OS === 'android') {
      console.log('Checking Downloads dir', APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID);
      const exists = await RNFS.exists(APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID);
      console.log('External Directory exists?:', exists);
      // !exists && await makeDirectory(APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID);
      dispatch(doesDownloadsDirectoryExist(exists));
    }
    if (subDirectory !== undefined) {
      if (isExternal) {
        console.log('SUBDIR isExternal', APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID + subDirectory);
        const exists = await RNFS.exists(APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID + subDirectory);
        return exists;
      }
      else {
        const exists = await RNFS.exists(APP_DIRECTORIES.BACKUP_DIR + subDirectory);
        console.log(APP_DIRECTORIES.BACKUP_DIR + subDirectory + ' Exists:' + exists);
        return exists;
      }
    }
    else {
      const exists = await RNFS.exists(APP_DIRECTORIES.BACKUP_DIR);
      console.log('Backup Directory exists?:', exists);
      dispatch(doesBackupDirectoryExist(exists));
      return exists;
    }
  };

  const downloadAndSaveImage = async (imageId) => {
    const begin = (res) => {
      console.log('BEGIN DOWNLOAD RES', res);
    };
    // return request('GET', '/pi/' + imageId, user.encoded_login, {responseType: 'blob'});
    return RNFS.downloadFile({
      fromUrl: STRABO_APIS.IMAGE + imageId,
      toFile: APP_DIRECTORIES.IMAGES + imageId + '.jpg',
      begin: (begin),
      headers: {
        'Authorization': 'Basic ' + user.encoded_login,
        'Accept': 'application/json',
      },
    }).promise.then(async (res) => {
        console.log('Image Info', res, ' JobID:', res.jobId);
        if (res.statusCode === 200) {
          console.log(`File ${imageId} saved to: ${APP_DIRECTORIES.IMAGES}`);
        }
        else if (res.statusCode === 404) {
          console.log('Image not found!');
          throw Error(`Image ${imageId} not found!`);
        }
      },
    );
  };

  const downloadAndSaveMap = async (downloadOptions) => {
    const res = await useServerRequests.timeoutPromise(60000, RNFS.downloadFile(downloadOptions).promise);
    if (res.statusCode === 200) {
      console.log(res);
    }
    else {
      console.error('Server Error');
      throw new Error('Error downloading tiles from ' + downloadOptions.fromUrl);
    }
  };


  const getExternalProjectData = async () => {
    // try {
    const res = await DocumentPicker.pick({type: [DocumentPicker.types.zip], copyTo: 'cachesDirectory'});
    console.log('External Document', res);
    return res[0];
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

  const makeDirectory = async (directory) => {
    try {
      return await RNFS.mkdir(directory);
    }
    catch (err) {
      console.error('Unable to create directory', directory, 'ERROR:', err);
    }
  };

  const moveFile = async (source, destination) => {
    try {
      await RNFS.moveFile(source, destination);
    }
    catch (err) {
      console.error('Error moving file', err);
    }
  };

  const readDirectory = async (directory) => {
    let files = [];
    files = await RNFS.readdir(directory);
    console.log('Directory files', files);
    return files;
  };

  const readDirectoryForMapTiles = async (directory, mapId) => {
    try {
      let tiles = [];
      mapId = mapId.includes('/') ? mapId.split('/')[1] : mapId;
      const exists = await RNFS.exists(directory + mapId + '/tiles');
      console.log('Map tiles cache tiles directory:', exists);
      if (exists) {
        tiles = await RNFS.readdir(directory + mapId + '/tiles');
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

  const readFile = async (source) => {
    return await RNFS.readFile(source);
  };

  const requestReadDirectoryPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Need permission to read Downloads Folder',
          message:
            'StraboSpot2 needs permission to access your Downloads Folder to retrieve backups,',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can read the folder');
      }
      else {
        console.log('Folder read permission denied');
      }
    }
    catch (err) {
      console.warn(err);
    }
  };

  const unZipAndCopyImportedData = async (zipFile) => {
    try {
      const fileName = zipFile.name.replace('.zip', '');
      // const file = zipFile.name.replace(' ', '_');
      const source = APP_DIRECTORIES.EXPORT_FILES_ANDROID + zipFile.name;
      console.log(source);
      const dest = APP_DIRECTORIES.BACKUP_DIR + fileName;

      await RNFS.copyFile(zipFile.fileCopyUri, APP_DIRECTORIES.EXPORT_FILES_ANDROID + zipFile.name);
      console.log('Files copied to export folder!');

      const unzippedFilePath = await unzip(source, dest);
      return unzippedFilePath;
    }
    catch (err) {
      console.error('Error unzipping imported file', err);
      throw Error(err);
    }

  };

  const writeFileToDevice = async (path, filename, data) => {
    try {
      await RNFS.writeFile(path + '/' + filename, JSON.stringify(data), 'utf8');
      console.log('FILES WRITTEN SUCCESSFULLY TO INTERNAL STORAGE!');
      console.log(path + '/' + filename);
    }
    catch (err) {
      console.error('Write Error!', err.message);
      // Alert.alert('Error:', 'There is an issue writing the project data \n' + err.toString());
      throw Error(err);
    }
  };

  return {
    copyFiles: copyFiles,
    createProjectDirectories: createProjectDirectories,
    deleteOfflineMap: deleteOfflineMap,
    deleteFromDevice: deleteFromDevice,
    doesBackupFileExist: doesBackupFileExist,
    doesDeviceBackupDirExist: doesDeviceBackupDirExist,
    doesDeviceDirectoryExist: doesDeviceDirectoryExist,
    doesDeviceDirExist: doesDeviceDirExist,
    downloadAndSaveImage: downloadAndSaveImage,
    downloadAndSaveMap: downloadAndSaveMap,
    getExternalProjectData: getExternalProjectData,
    openURL: openURL,
    makeDirectory: makeDirectory,
    moveFile: moveFile,
    readDirectory: readDirectory,
    readDirectoryForMapTiles: readDirectoryForMapTiles,
    readDirectoryForMapFiles: readDirectoryForMapFiles,
    readFile: readFile,
    requestReadDirectoryPermission: requestReadDirectoryPermission,
    unZipAndCopyImportedData: unZipAndCopyImportedData,
    writeFileToDevice: writeFileToDevice,
  };
};

export default useDevice;
