import RNFS from 'react-native-fs';
import {unzip} from 'react-native-zip-archive';
import {batch, useDispatch} from 'react-redux';

import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setStatusMessagesModalVisible,
  setLoadingStatus,
  setErrorMessagesModalVisible,
} from '../modules/home/home.slice';
import {addedCustomMapsFromBackup} from '../modules/maps/maps.slice';
import {addedMapsFromDevice} from '../modules/maps/offline-maps/offlineMaps.slice';
import {addedDatasets, addedProject, setSelectedProject} from '../modules/project/projects.slice';
import {addedSpotsFromDevice} from '../modules/spots/spots.slice';
import {isEmpty} from '../shared/Helpers';
import {APP_DIRECTORIES} from './device.constants';
import useDeviceHook from './useDevice';

const useImport = () => {
  let fileCount = 0;
  let neededTiles = 0;
  let notNeededTiles = 0;

  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);

  const useDevice = useDeviceHook();

  const copyZipMapsForDistribution = async (fileName) => {
    try {
      const checkDirSuccess = await useDevice.doesDeviceBackupDirExist(fileName + '/maps');
      console.log('Found map zips folder', checkDirSuccess);
      if (checkDirSuccess) {
        await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.APP_DIR);
        await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.TILE_ZIP);
        const fileEntries = await RNFS.readdir(
          APP_DIRECTORIES.BACKUP_DIR + fileName + '/maps');

        if (fileEntries) {
          dispatch(addedStatusMessage('Importing maps...'));
          await Promise.all(
            fileEntries.map(async fileEntry => {
              const source = APP_DIRECTORIES.BACKUP_DIR + fileName + '/maps/' + fileEntry;
              const dest = APP_DIRECTORIES.TILE_ZIP + fileEntry;
              await RNFS.copyFile(source, dest).then(() => {
                console.log(`File ${fileEntry} Copied`);
              })
                .catch(async err => {
                  console.error('Error copying maps.', err);
                  await RNFS.unlink(dest);
                  console.log(`${fileEntry} removed`);
                  await RNFS.copyFile(source, dest);
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

  const checkForMaps = async (dataFile, selectedProject) => {
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
      const mapsFolderExists = await copyZipMapsForDistribution(selectedProject.fileName, dataFile);
      if (mapsFolderExists) {
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage('Finished importing maps.'));
        console.log('Finished importing maps.');
        await unzipFile(selectedProject.fileName);
        console.log('Finished unzipping all files');
        dispatch(addedStatusMessage(`Finished copying and ${'\n'}unzipping all files`));
        dispatch(addedStatusMessage('Moving Maps...'));
        progress = await moveFiles(dataFile);
        console.log('fileCount', progress);
        // dispatch(addedCustomMapsFromBackup(otherMapsDb));
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
        dispatch(addedStatusMessage('No map tiles to import.'));
      }
    }
    else {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('No maps to import.'));
    }
  };

  const unzipFile = async () => {
    try {
      const checkDirSuccess = await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.TILE_TEMP);
      console.log(checkDirSuccess);
      if (checkDirSuccess) {
        const fileEntries = await RNFS.readdir(APP_DIRECTORIES.TILE_ZIP);
        console.log(fileEntries);
        await Promise.all(
          fileEntries.map(async file => {
            const source = APP_DIRECTORIES.TILE_ZIP + file;
            const dest = APP_DIRECTORIES.TILE_TEMP;
            await unzip(source, dest);
            console.log('unzip completed');
          }),
        );
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
      await RNFS.unlink(source);
      console.log('.zip file removed successfully!');
      return unzippedFile;
    }
    catch (err) {
      console.error('Error unzipping backup files', err);
    }
  };

  const moveFiles = async (dataFile, zipId) => {
    console.log(dataFile.mapNamesDb);
    await Promise.all(
      await Object.values(dataFile.mapNamesDb).map(async map => {
      const checkSuccess = await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.TILE_CACHE + map.id + '/tiles/');
        if (checkSuccess) {
          console.log('dir exists');
          const files = await RNFS.readdir(APP_DIRECTORIES.TILE_TEMP);
          const zipId = files.find(zipId => zipId === map.mapId);
          const fileEntries = await RNFS.readdir(APP_DIRECTORIES.TILE_TEMP + zipId + '/tiles');
          await moveTile(fileEntries, zipId, map);
        }
      }),
    );
    return {fileCount: fileCount, neededTiles: neededTiles, notNeededTiles: notNeededTiles};
  };

  const moveTile = async (tileArray, zipId, map) => {
    await Promise.all(
      tileArray.map(async tile => {
        fileCount++;
        const fileExists = await RNFS.exists(APP_DIRECTORIES.TILE_CACHE + map.id + '/tiles/' + tile);
        if (!fileExists) {
          await RNFS.moveFile(
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

  const loadProjectFromDevice = async (selectedProject) => {
    dispatch(setLoadingStatus({view: 'modal', bool: true}));
    dispatch(addedStatusMessage(`Importing ${selectedProject.fileName}...`));
    console.log('SELECTED PROJECT', selectedProject);
    const dirExists = await useDevice.doesDeviceBackupDirExist(selectedProject.fileName);
    if (dirExists) {
      const dataFile = await readDeviceJSONFile(selectedProject.fileName);
      const {projectDb, spotsDb, otherMapsDb, mapNamesDb} = dataFile;
      console.log(dirExists);
      dispatch(addedSpotsFromDevice(spotsDb));
      dispatch(addedProject(projectDb.project));
      dispatch(addedDatasets(projectDb.datasets));
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(`${selectedProject.fileName}\nProject loaded.`));
      await checkForMaps(dataFile, selectedProject);
      dispatch(addedStatusMessage('Importing image files...'));
      await copyImages(selectedProject.fileName);
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      dispatch(setSelectedProject({project: '', source: ''}));
      return Promise.resolve({project: dataFile.projectDb.project});
    }
  };

  const copyImages = async (fileName) => {
    try {
      const exists = await RNFS.exists(APP_DIRECTORIES.BACKUP_DIR
        + fileName + '/Images');
      if (exists) {
        const imageFiles = await RNFS.readdir(APP_DIRECTORIES.BACKUP_DIR
          + fileName + '/Images');
        console.log(imageFiles);
        await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.IMAGES);
        if (!isEmpty(imageFiles)) {
          imageFiles.map(async image => {
            await RNFS.copyFile(APP_DIRECTORIES.BACKUP_DIR
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
    const dataFile = '/data.json';
    return await RNFS.readFile(APP_DIRECTORIES.BACKUP_DIR + fileName + dataFile).then(
      response => {
        return Promise.resolve(JSON.parse(response));
      }, () => {
        batch(() => {
          dispatch(setStatusMessagesModalVisible(false));
          dispatch(clearedStatusMessages());
          dispatch(addedStatusMessage('Project Not Found'));
          dispatch(setErrorMessagesModalVisible(true));
        });
      });
  };

  return {
    copyZipMapsForDistribution: copyZipMapsForDistribution,
    loadProjectFromDevice: loadProjectFromDevice,
    moveFiles: moveFiles,
    readDeviceJSONFile: readDeviceJSONFile,
    unzipFile: unzipFile,
    unzipBackupFile: unzipBackupFile,
  };
};

export default useImport;
