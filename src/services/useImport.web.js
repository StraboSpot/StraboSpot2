// import {unzip} from 'react-native-zip-archive';
import {batch, useDispatch, useSelector} from 'react-redux';

import {APP_DIRECTORIES} from './directories.constants';
import useDeviceHook from './useDevice';
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

const useImport = () => {
  let fileCount = 0;
  let neededTiles = 0;
  let notNeededTiles = 0;
  let mapFailures = 0;

  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);

  const useDevice = useDeviceHook();

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
      console.error('Error checking existence of backup images dir.', err);
    }
  };

  const copyZipMapsToProject = async (fileName, isExternal) => {
    try {
      const sourceDir = isExternal ? APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID : APP_DIRECTORIES.BACKUP_DIR;
      const checkDirSuccess = await useDevice.doesDeviceBackupDirExist(fileName + '/maps');
      console.log('Found map zips folder', checkDirSuccess);
      if (checkDirSuccess) {
        await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.APP_DIR);
        await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.TILE_ZIP);
        const fileEntries = await useDevice.readDirectory(sourceDir + fileName + '/maps');
        console.log(sourceDir + ' files' + fileEntries);
        if (fileEntries) {
          dispatch(addedStatusMessage('Importing maps...'));
          await Promise.all(
            fileEntries.map(async (fileEntry) => {
              const source = sourceDir + fileName + '/maps/' + fileEntry;
              const dest = APP_DIRECTORIES.TILE_ZIP + fileEntry;
              await useDevice.copyFiles(source, dest).then(() => {
                console.log(`File ${fileEntry} Copied`);
              })
                .catch(async (err) => {
                  console.error('Error copying maps.', err);
                  await useDevice.deleteFromDevice(dest);
                  console.log(`${fileEntry} removed`);
                  await useDevice.copyFiles(source, dest);
                  console.log(`File ${fileEntry} Copied`);
                });
            }),
          );
        }
        return true;
      }
      else {
        return false;
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
      // const mapsFolderExists = await copyZipMapsToProject(selectedProject.fileName, isExternal);
      // if (mapsFolderExists) {
      //   dispatch(removedLastStatusMessage());
      //   dispatch(addedStatusMessage('Finished importing maps.'));
      //   console.log('Finished importing maps.');
      //   await unzipFile(selectedProject.fileName);
      //   console.log('Finished unzipping all files');
      //   dispatch(addedStatusMessage(`Finished copying and ${'\n'}unzipping all files`));
      //   dispatch(addedStatusMessage('Moving Maps...'));
      //   progress = await moveFiles(dataFile);
      //   console.log('fileCount', progress);
      //   // dispatch(addedCustomMapsFromBackup(otherMapsDb));
      //   dispatch(addedMapsFromDevice({mapType: 'offlineMaps', maps: mapNamesDb}));
      //   dispatch(removedLastStatusMessage());
      //   batch(() => {
      //     dispatch(addedStatusMessage('---------------------'));
      //     dispatch(addedStatusMessage(`Map tiles imported: ${progress.fileCount}`));
      //     dispatch(addedStatusMessage(`Map tiles installed: ${progress.neededTiles}`));
      //     dispatch(addedStatusMessage(`Map tiles already installed: ${progress.notNeededTiles}`));
      //     dispatch(addedStatusMessage('Finished moving tiles'));
      //   });
      // }
      // else {
      //   dispatch(removedLastStatusMessage());
      //   dispatch(addedStatusMessage('No map tiles to import.'));
      // }
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

  const moveFiles = async (dataFile, zipId) => {
    try {
      console.log(dataFile.mapNamesDb);
      await Promise.all(
        Object.values(dataFile.mapNamesDb).map(async (map) => {
          const checkSuccess = await useDevice.doesDeviceDirectoryExist(
            APP_DIRECTORIES.TILE_CACHE + map.id + '/tiles/');
          if (checkSuccess) {
            console.log('dir exists');
            const files = await useDevice.readDirectory(APP_DIRECTORIES.TILE_TEMP);
            const zipId = files.find(zipId => zipId === map.mapId);
            if (zipId) {
              const fileEntries = await useDevice.readDirectory(APP_DIRECTORIES.TILE_TEMP + zipId + '/tiles');
              await moveTile(fileEntries, zipId, map);
            }
            else {
              mapFailures++;
              console.log('Map file not found', mapFailures);
            }
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

  const moveTile = async (tileArray, zipId, map) => {
    await Promise.all(
      tileArray.map(async (tile) => {
        fileCount++;
        const fileExists = await useDevice.doesDeviceDirExist(APP_DIRECTORIES.TILE_CACHE + map.id + '/tiles/' + tile);
        if (!fileExists) {
          await useDevice.moveFile(
            APP_DIRECTORIES.TILE_TEMP + zipId + '/tiles/' + tile,
            APP_DIRECTORIES.TILE_CACHE + map.id + '/tiles/' + tile);
          neededTiles++;
        }
        else {
          notNeededTiles++;
        }
      }),
    );
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

  const unzipFile = async () => {
    try {
      const checkDirSuccess = await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.TILE_TEMP);
      console.log(checkDirSuccess);
      // if (checkDirSuccess) {
      //   const fileEntries = await useDevice.readDirectory(APP_DIRECTORIES.TILE_ZIP);
      //   console.log(fileEntries);
      //   await Promise.all(
      //     fileEntries.map(async (file) => {
      //       const fileExtension = file.substring(file.lastIndexOf('.') + 1);
      //       if (fileExtension === 'zip') {
      //         const source = APP_DIRECTORIES.TILE_ZIP + file;
      //         const dest = APP_DIRECTORIES.TILE_TEMP;
      //         await unzip(source, dest);
      //         console.log('unzip completed', file, 'to destination:', dest);
      //       }
      //       else console.log('its not a zip file');
      //     }),
      //   );
      // }
    }
    catch (err) {
      console.error('Error unzipping files', err);
    }
  };

  const unzipBackupFile = async (zipFile) => {
    // try {
    //   const source = APP_DIRECTORIES.BACKUP_DIR + zipFile;
    //   const target = APP_DIRECTORIES.BACKUP_DIR;
    //
    //   const unzippedFile = await unzip(source, target);
    //   console.log('backup file unzipped successfully!');
    //   await useDevice.deleteFromDevice(source);
    //   console.log('.zip file removed successfully!');
    //   return unzippedFile;
    // }
    // catch (err) {
    //   console.error('Error unzipping backup files', err);
    // }
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
