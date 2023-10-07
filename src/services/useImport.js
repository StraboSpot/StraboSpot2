import {useEffect} from 'react';

import {unzip} from 'react-native-zip-archive';
import {batch, useDispatch, useSelector} from 'react-redux';

import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setErrorMessagesModalVisible,
  setLoadingStatus,
  setStatusMessagesModalVisible,
} from '../modules/home/home.slice';
import {addedCustomMapsFromBackup, clearedMaps} from '../modules/maps/maps.slice';
import {addedMapsFromDevice} from '../modules/maps/offline-maps/offlineMaps.slice';
import {
  addedDatasets,
  addedProject,
  clearedDatasets,
  setActiveDatasets,
  setSelectedDataset,
  setSelectedProject,
} from '../modules/project/projects.slice';
import {addedSpotsFromDevice, clearedSpots} from '../modules/spots/spots.slice';
import {isEmpty} from '../shared/Helpers';
import {APP_DIRECTORIES} from './directories.constants';
import useDeviceHook from './useDevice';

const useImport = () => {
  let isOldBackup;
  let fileCount = 0;
  let neededTiles = 0;
  let notNeededTiles = 0;
  let mapFailures = 0;

  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);

  const useDevice = useDeviceHook();

  useEffect(() => {
    console.log('ISOLDBACKUP', isOldBackup);
  }, [isOldBackup]);

  const copyZipMapsToProject = async (fileName, isExternal) => {
    try {
      const sourceDir = isExternal ? APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID : APP_DIRECTORIES.BACKUP_DIR;
      const checkDirSuccess = await useDevice.doesDeviceBackupDirExist(fileName + '/maps');
      console.log('Found map zips folder', checkDirSuccess);
      if (checkDirSuccess) {
        await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.APP_DIR);
        await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.TILE_ZIP);
        let zipFiles = await useDevice.readDirectory(sourceDir + fileName + '/maps');
        if (zipFiles.length <= 2 && zipFiles.includes('OfflineTiles.zip')) {
          isOldBackup = false;
          dispatch(addedStatusMessage('Importing maps...'));
          console.log('New Zip Method');
          zipFiles = zipFiles.filter(zip => zip === 'OfflineTiles.zip');
          await unzipFile(sourceDir + fileName + '/maps/' + zipFiles[0]);
          console.log('Offline Maps File Unzipped!');
        }
        else {
          console.log('Old Zip Method');
          isOldBackup = true;
          await Promise.all(
            zipFiles.map(async fileEntry => await unzipFile(sourceDir + fileName + '/maps/' + fileEntry)),
          );
          console.log('All map zips unzipped');
        }
      }
    }
    catch (err) {
      console.error('Error Copying Maps for Distribution', err);
    }
  };

  const checkForMaps = async (dataFile, selectedProject, isExternal) => {
    let progress;
    const {mapNamesDb, otherMapsDb} = dataFile;
    dispatch(addedStatusMessage('Checking for maps to import...'));
    if (!isEmpty(otherMapsDb)) {
      dispatch(removedLastStatusMessage());
      dispatch(addedCustomMapsFromBackup(otherMapsDb));
      dispatch(addedStatusMessage('Added custom maps.'));
    }
    else {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('No custom maps to import.'));
    }
    dispatch(addedStatusMessage('Checking for map tiles to import...'));
    if (!isEmpty(mapNamesDb)) {
      await copyZipMapsToProject(selectedProject.fileName, isExternal);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished importing maps.'));
      dispatch(addedStatusMessage(`Finished copying and ${'\n'}unzipping all files`));
      dispatch(addedStatusMessage('Moving Maps...'));
      progress = await moveFiles(dataFile);
      console.log('fileCount', progress);
      dispatch(addedMapsFromDevice({mapType: 'offlineMaps', maps: mapNamesDb}));
      dispatch(removedLastStatusMessage());
      batch(() => {
        dispatch(addedStatusMessage('---------------------'));
        dispatch(addedStatusMessage(`Map tiles imported: ${progress.fileCount}`));
        dispatch(addedStatusMessage(`Map tiles installed: ${progress.neededTiles}`));
        dispatch(addedStatusMessage(`Map tiles already installed: ${progress.notNeededTiles}`));
        dispatch(addedStatusMessage('Finished moving tiles'));
      });
    }
    else {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('No maps to import.'));
    }
  };

  const destroyOldProject = () => {
    batch(() => {
      dispatch(clearedSpots());
      dispatch(clearedDatasets());
      dispatch(clearedMaps());
    });
    console.log('Destroy batch complete');
  };

  const unzipFile = async (filePath) => {
    try {
      const checkDirSuccess = await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.TILE_TEMP);
      console.log(checkDirSuccess);
      if (checkDirSuccess) {
        if (isOldBackup) {
          const fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
          if (fileExtension === 'zip') {
            const source = filePath;
            const dest = APP_DIRECTORIES.TILE_TEMP;
            await unzip(source, dest);
            console.log('unzip completed', filePath, 'to destination:', dest);
          }
        }
        else {
          const fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
          if (fileExtension === 'zip') {
            const source = filePath;
            const dest = APP_DIRECTORIES.TILE_TEMP;
            await unzip(source, dest);
          }
        }
      }
    }
    catch (err) {
      console.error('Error unzipping files', err);
    }
  };

  const unzipBackupFile = async (zipFile) => {
    try {
      const source = APP_DIRECTORIES.BACKUP_DIR + zipFile;
      const target = APP_DIRECTORIES.BACKUP_DIR;

      const unzippedFile = await unzip(source, target);
      console.log('backup file unzipped successfully!');
      await useDevice.deleteFromDevice(source);
      console.log('.zip file removed successfully!');
      return unzippedFile;
    }
    catch (err) {
      console.error('Error unzipping backup files', err);
    }
  };

  const moveFiles = async (dataFile) => {
    try {
      let fileEntries = [];
      console.log(dataFile.mapNamesDb);
      await Promise.all(
        Object.values(dataFile.mapNamesDb).map(async (map) => {
          const checkSuccess = await useDevice.doesDeviceDirectoryExist(
            APP_DIRECTORIES.TILE_CACHE + map.id + '/tiles/');
          if (checkSuccess) {
            console.log('dir exists');
            const files = await useDevice.readDirectory(APP_DIRECTORIES.TILE_TEMP);
            const mapId = files.find(id => id === map.id);
            const zipID = files.find(zipId => zipId === map.mapId);
            const id = isOldBackup ? zipID : mapId;
            if (id) fileEntries = await useDevice.readDirectory(APP_DIRECTORIES.TILE_TEMP + id + '/tiles');
            else {
              mapFailures++;
              console.log('Map file not found', mapFailures);
            }
            await moveTile(fileEntries, id, map);
          }
        }),
      );
      console.log('Move Files Promise Complete!!!');
      return {fileCount: fileCount, neededTiles: neededTiles, notNeededTiles: notNeededTiles, mapFailures: mapFailures};
    }
    catch (err) {
      console.error('Error in moveFiles()', err);
    }
  };

  const moveTile = async (tileArray, id, map) => {
    await Promise.all(
      tileArray.map(async (tile) => {
        fileCount++;
        const fileExists = await useDevice.doesDeviceDirExist(APP_DIRECTORIES.TILE_CACHE + map.id + '/tiles/' + tile);
        if (!fileExists) {
          await useDevice.moveFile(
            APP_DIRECTORIES.TILE_TEMP + id + '/tiles/' + tile,
            APP_DIRECTORIES.TILE_CACHE + map.id + '/tiles/' + tile);
          neededTiles++;
        }
        else {
          notNeededTiles++;
        }
      }),
    );
  };

  const loadProjectFromDevice = async (selectedProject, isExternal) => {
    dispatch(clearedStatusMessages());
    dispatch(setStatusMessagesModalVisible(true));
    dispatch(setLoadingStatus({view: 'modal', bool: true}));
    dispatch(addedStatusMessage(`Importing ${selectedProject.fileName}...`));
    console.log('SELECTED PROJECT', selectedProject);
    if (!isEmpty(project)) destroyOldProject();
    console.log('Old project destroyed', project);
    const dirExists = await useDevice.doesDeviceBackupDirExist(selectedProject.fileName);
    if (dirExists) {
      const dataFile = await readDeviceJSONFile(selectedProject.fileName);
      const {projectDb, spotsDb} = dataFile;
      console.log('DataFile', dataFile);
      dispatch(addedSpotsFromDevice(spotsDb));
      dispatch(addedProject(projectDb.project));
      dispatch(addedDatasets(projectDb.datasets));
      if (Object.values(projectDb.datasets).length > 0 && !isEmpty(Object.values(projectDb.datasets)[0])) {
        dispatch(setActiveDatasets({bool: true, dataset: Object.values(projectDb.datasets)[0].id}));
        dispatch(setSelectedDataset(Object.values(projectDb.datasets)[0].id));
      }
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(`${selectedProject.fileName}\nProject loaded.`));
      dispatch(addedStatusMessage('Importing image files...'));
      await copyImages(selectedProject.fileName);
      await checkForMaps(dataFile, selectedProject, isExternal);
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      dispatch(setSelectedProject({project: '', source: ''}));
      return Promise.resolve({project: dataFile.projectDb.project});
    }
  };

  const copyImages = async (fileName) => {
    try {
      const exists = await useDevice.doesDeviceDirExist(APP_DIRECTORIES.BACKUP_DIR
        + fileName + '/Images');
      if (exists) {
        const imageFiles = await useDevice.readDirectory(APP_DIRECTORIES.BACKUP_DIR
          + fileName + '/Images');
        console.log(imageFiles);
        await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.IMAGES);
        if (!isEmpty(imageFiles)) {
          imageFiles.map(async (image) => {
            await useDevice.copyFiles(APP_DIRECTORIES.BACKUP_DIR
              + fileName + '/Images/' + image, APP_DIRECTORIES.IMAGES + image);
          });
          dispatch(removedLastStatusMessage());
          dispatch(addedStatusMessage('Finished importing image files.'));
        }
        else {
          dispatch(removedLastStatusMessage());
          dispatch(addedStatusMessage('No image files.'));
        }
      }
      else {
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage('No image files.'));
      }
    }
    catch (err) {
      console.error('Error checking existance of backup images dir.', err);
    }
  };


  const readDeviceJSONFile = async (fileName) => {
    try {
      // await requestReadDirectoryPermission();
      const dataFile = '/data.json';
      console.log(APP_DIRECTORIES.BACKUP_DIR + fileName + dataFile);
      const response = await useDevice.readFile(APP_DIRECTORIES.BACKUP_DIR + fileName + dataFile);
      console.log(JSON.parse(response));
      return JSON.parse(response);
    }
    catch (err) {
      console.error('Error reading JSON file', err);
      batch(() => {
        dispatch(setStatusMessagesModalVisible(false));
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage('Project Not Found'));
        dispatch(setErrorMessagesModalVisible(true));
      });
    }
  };

  return {
    copyZipMapsToProject: copyZipMapsToProject,
    loadProjectFromDevice: loadProjectFromDevice,
    moveFiles: moveFiles,
    readDeviceJSONFile: readDeviceJSONFile,
    unzipFile: unzipFile,
    unzipBackupFile: unzipBackupFile,
  };
};

export default useImport;
