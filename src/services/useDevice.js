import {Linking, PermissionsAndroid, Platform} from 'react-native';

import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {unzip} from 'react-native-zip-archive';
import {useDispatch, useSelector} from 'react-redux';

import {APP_DIRECTORIES} from './directories.constants';
import useServerRequestsHook from './useServerRequests';
import {deletedOfflineMap} from '../modules/maps/offline-maps/offlineMaps.slice';
import {doesBackupDirectoryExist, doesDownloadsDirectoryExist} from '../modules/project/projects.slice';
import usePermissionsHook from '../services/usePermissions';

const {PERMISSIONS, RESULTS} = PermissionsAndroid;

const useDevice = () => {
  const usePermissions = usePermissionsHook();

  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const useServerRequests = useServerRequestsHook();

  const copyFiles = async (source, target) => {
    try {
      await RNFS.copyFile(source, target);
    }
    catch (err) {
      throw Error(err);
    }
  };

  // INTERNAL
  const createAppDirectory = async (directory) => {
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

  const createProjectDirectories = async () => {
    // console.log('STOP!!');
    if (Platform.OS === 'android') {
      const permissionsGranted = await usePermissions.checkPermission(PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (permissionsGranted === RESULTS.GRANTED) {
        await makeDirectory(APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID);
        console.log('Android Downloads/StraboSpot/Backups directory created');
        await makeDirectory(APP_DIRECTORIES.EXPORT_FILES_ANDROID);
        console.log('AndroidExportFiles directory created');
      }
      else {
        console.log('PERMISSION NOT GRANTED', permissionsGranted);
      }
    }
    if (Platform.OS === 'ios') {
      await makeDirectory(APP_DIRECTORIES.EXPORT_FILES_IOS);
      console.log('Distribution directory created for iOS');
    }
    await makeDirectory(APP_DIRECTORIES.APP_DIR);
    console.log('App Directory Created');
    await makeDirectory(APP_DIRECTORIES.IMAGES);
    console.log('Images Directory Created');
    await makeDirectory(APP_DIRECTORIES.BACKUP_DIR);
    console.log('Backup Directory Created');

    await makeDirectory(APP_DIRECTORIES.TILES_DIRECTORY);
    console.log('Tiles Directory Created');
    await makeDirectory(APP_DIRECTORIES.TILE_CACHE);
    console.log('Tile Cache Directory Created');

    // console.log('Here are all the app directories created.', RNFS.readdir(APP_DIRECTORIES));
  };

  const deleteFromDevice = async (dir, file) => {
    console.log(dir + file);
    const filepath = file ? dir + file : dir;
    await RNFS.unlink(filepath);
    console.log(`${file ? dir + file : dir} has been DELETED!`);
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

  const doesBackupFileExist = (filename) => {
    return RNFS.exists(APP_DIRECTORIES.BACKUP_DIR + filename + '/data.json');
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
        console.log('SUB-DIR isExternal', APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID + subDirectory);
        return await RNFS.exists(APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID + subDirectory);
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

  const doesDeviceDirExist = async (dir) => {
    return await RNFS.exists(dir);
  };

  // TODO: Check to consolidate with doesDeviceDirExist();
  const doesDeviceDirectoryExist = async (directory) => {
    try {
      let checkDirSuccess = await RNFS.exists(directory);
      // Create Images directory if it does not exist
      if (!checkDirSuccess) checkDirSuccess = await createAppDirectory(directory);
      if (checkDirSuccess) console.log('Images directory exists:', directory);
      else throw Error;
      return checkDirSuccess;
    }
    catch (err) {
      console.error('Error in doesDeviceDirectoryExist()', err);
      throw Error(err);
    }
  };

  const doesFileExist = async (path, file) => {
    return await RNFS.exists(path + file);
  };

  const downloadAndSaveImage = async (imageId) => {
    const imageURI = useServerRequests.getImageUrl();
    return await RNFS.downloadFile({
      fromUrl: imageURI + imageId,
      toFile: APP_DIRECTORIES.IMAGES + imageId + '.jpg',
      begin: res => console.log('Starting to download Image', imageId, res),
      headers: {
        'Authorization': 'Basic ' + user.encoded_login,
        'Accept': 'application/json',
      },
    }).promise.then(async (res) => {
        console.log('Image', imageId, 'RNFS downloadFile response:', res);
        if (res.statusCode === 200) {
          console.log(`Image ${imageId} downloaded and saved to: ${APP_DIRECTORIES.IMAGES}`, res);
          return res.statusCode;
        }
        else if (res.statusCode === 404) throw Error('Image ' + imageId + ' not found on Server');
        else throw Error('Image ' + imageId + ' unknown error');
      },
    )
      .catch((err) => {
        console.log('RNFS Download Error', err);
        console.warn(`Current URL ${imageURI + imageId}`);
      });
  };

  const downloadAndSaveMap = async (downloadOptions) => {
    try {
      const res = await RNFS.downloadFile(downloadOptions).promise;
      if (res.statusCode === 200) {
          console.log(`Download Complete to ${downloadOptions.toFile}`);
      }
    }
    catch (err) {
      console.error('An error occurred:', err);
    }
  };

  const getExternalProjectData = async () => {
    const options = {
      type: [DocumentPicker.types.zip],
      copyTo: 'cachesDirectory',
      // presentationStyle: Platform.OS === 'ios' && 'fullScreen',
      transitionStyle: Platform.OS === 'ios' && 'flipHorizontal',
    };
    // try {
    const res = await DocumentPicker.pickSingle(options);
    console.log('External Document', res);
    return res;
  };

  const isPickDocumentCanceled = (err) => {
    return DocumentPicker.isCancel(err);
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

  const pickCSV = async () => {
    return await DocumentPicker.pickSingle({type: [DocumentPicker.types.csv]});
  };

  const readDirectory = async (directory) => {
    const files = await RNFS.readdir(directory);
    console.log('Directory files', files);
    return files;
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

  const readFile = async (source) => {
    try {
      return await RNFS.readFile(source);
    }
    catch (e) {
      console.error('Error reading file as utf8', e);
      try {
        return await RNFS.readFile(source, 'ascii');
      }
      catch (e2) {
        console.error('Error reading file as ascii:', e2);
        throw Error();
        // return undefined;
      }
    }
  };

  const readDeviceJSONFile = async (fileName) => {
    try {
      // const granted = await usePermissions.checkPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      // if (granted) {
      const dataFile = '/data.json';
      console.log(APP_DIRECTORIES.BACKUP_DIR + fileName + dataFile);
      const response = await readFile(APP_DIRECTORIES.BACKUP_DIR + fileName + dataFile);
      console.log(JSON.parse(response));
      return JSON.parse(response);
      // }
      // else {
      //  const permissionStatus = await usePermissions.requestPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      //  console.log('Permission Status', permissionStatus);
      // }
    }
    catch (err) {
      console.error('Error reading JSON file', err);
    }
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
      let fileName = '';
      if (Platform.OS === 'android') {
        if (await RNFS.exists(APP_DIRECTORIES.EXPORT_FILES_ANDROID)) {
          await RNFS.copyFile(zipFile.fileCopyUri, APP_DIRECTORIES.EXPORT_FILES_ANDROID + zipFile.name);
          console.log('Files copied to Android export folder!');
        }
        else {
          await makeDirectory(APP_DIRECTORIES.EXPORT_FILES_ANDROID);
          await unZipAndCopyImportedData(zipFile);
        }
      }
      fileName = zipFile.name.replace('.zip', '');
      const source = Platform.OS === 'ios' ? zipFile.fileCopyUri : APP_DIRECTORIES.EXPORT_FILES_ANDROID + zipFile.name;
      const dest = Platform.OS === 'ios' ? APP_DIRECTORIES.BACKUP_DIR + fileName : APP_DIRECTORIES.BACKUP_DIR + fileName;

      console.log('SOURCE', source);
      console.log('DEST', dest);

      await unzip(source, dest);
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
      throw Error(err);
    }
  };

  return {
    copyFiles: copyFiles,
    createProjectDirectories: createProjectDirectories,
    deleteFromDevice: deleteFromDevice,
    deleteOfflineMap: deleteOfflineMap,
    doesBackupFileExist: doesBackupFileExist,
    doesDeviceBackupDirExist: doesDeviceBackupDirExist,
    doesDeviceDirExist: doesDeviceDirExist,
    doesDeviceDirectoryExist: doesDeviceDirectoryExist,
    doesFileExist: doesFileExist,
    downloadAndSaveImage: downloadAndSaveImage,
    downloadAndSaveMap: downloadAndSaveMap,
    getExternalProjectData: getExternalProjectData,
    isPickDocumentCanceled: isPickDocumentCanceled,
    makeDirectory: makeDirectory,
    moveFile: moveFile,
    openURL: openURL,
    pickCSV: pickCSV,
    readDirectory: readDirectory,
    readDirectoryForMapFiles: readDirectoryForMapFiles,
    readDirectoryForMapTiles: readDirectoryForMapTiles,
    readFile: readFile,
    readDeviceJSONFile: readDeviceJSONFile,
    requestReadDirectoryPermission: requestReadDirectoryPermission,
    unZipAndCopyImportedData: unZipAndCopyImportedData,
    writeFileToDevice: writeFileToDevice,
  };
};

export default useDevice;
