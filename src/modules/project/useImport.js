import {Alert} from 'react-native';

import RNFS from 'react-native-fs';
import {unzip} from 'react-native-zip-archive';
import {useDispatch} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import {isEmpty} from '../../shared/Helpers';
import {addedCustomMapsFromBackup} from '../maps/maps.slice';
import {addedMapsFromDevice} from '../maps/offline-maps/offlineMaps.slice';
import {addedSpotsFromDevice} from '../spots/spots.slice';
import {addedDatasets, addedProject} from './projects.slice';
import {addedStatusMessage, clearedStatusMessages, removedLastStatusMessage} from '../home/home.slice';

const useImport = () => {
  let fileCount = 0;
  let neededTiles = 0;
  let notNeededTiles = 0;

  const devicePath = RNFS.DocumentDirectoryPath;
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';
  const appDirectory = '/StraboSpot';
  const imagesDirectory = appDirectory + '/Images';
  const appDirectoryTiles = '/StraboSpotTiles';
  const tileTempDirectory = devicePath + appDirectoryTiles + '/TileTemp';
  const zipsDirectory = appDirectoryTiles + '/TileZips';
  const tileCacheDirectory = devicePath + appDirectoryTiles + '/TileCache';

  const dispatch = useDispatch();

  const useDevice = useDeviceHook();

  const copyZipMapsForDistribution = async (fileName) => {
    try {
      const checkDirSuccess = await useDevice.doesDeviceBackupDirExist(fileName + '/maps');
      console.log('Found map zips folder', checkDirSuccess);
      await useDevice.doesDeviceDirectoryExist(devicePath + appDirectoryTiles);
      await useDevice.doesDeviceDirectoryExist(devicePath + zipsDirectory);
      const fileEntries = await RNFS.readdir(devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/maps');

      if (fileEntries) {
        await Promise.all(
          fileEntries.map(async fileEntry => {
            const source = devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/maps/' + fileEntry;
            const dest = devicePath + zipsDirectory + '/' + fileEntry;
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
    }
    catch (err) {
      console.error('Error Copying Maps for Distribution', err);
      console.log('ERROR COPING MAP', err);

    }
  };

  const unzipFile = async () => {
    try {
      const checkDirSuccess = await useDevice.doesDeviceDirectoryExist(tileTempDirectory);
      console.log(checkDirSuccess);
      if (checkDirSuccess) {
        const fileEntries = await RNFS.readdir(devicePath + zipsDirectory + '/');
        console.log(fileEntries);
        await Promise.all(
          fileEntries.map(async file => {
            const source = devicePath + zipsDirectory + '/' + file;
            const dest = tileTempDirectory;
            await unzip(source, dest);
            console.log('unzip completed');
          }),
        );
      }
    }
    catch (e) {
      console.error('Error unzipping files', e);
    }
  };

  const moveFiles = async (dataFile, zipId) => {
    console.log(dataFile.mapNamesDb);
    await Promise.all(
      await Object.values(dataFile.mapNamesDb).map(async map => {
        const checkSuccess = await useDevice.doesDeviceDirectoryExist(tileCacheDirectory + '/' + map.id + '/tiles/');
        if (checkSuccess) {
          console.log('dir exists');
          const files = await RNFS.readdir(tileTempDirectory);
          const zipId = files.find(zipId => zipId === map.mapId);
          const fileEntries = await RNFS.readdir(tileTempDirectory + '/' + zipId + '/tiles');
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
        const fileExists = await RNFS.exists(tileCacheDirectory + '/' + map.id + '/tiles/' + tile);
        if (!fileExists) {
          await RNFS.moveFile(
            tileTempDirectory + '/' + zipId + '/tiles/' + tile,
            tileCacheDirectory + '/' + map.id + '/tiles/' + tile);
          neededTiles++;
        }
        else {
          notNeededTiles++;
        }
      }),
    );
  };

  const loadProjectFromDevice = async (selectedProject) => {
    let progress;
    dispatch(clearedStatusMessages());
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
      dispatch(addedStatusMessage('Project loaded.'));
      if (!isEmpty(mapNamesDb) || !isEmpty(otherMapsDb)) {
        dispatch(addedStatusMessage('Importing maps...'));
        await copyZipMapsForDistribution(selectedProject.fileName, dataFile);
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage('Finished importing maps.'));
        console.log('Finished importing maps.');
        await unzipFile(selectedProject.fileName);
        console.log('Finished unzipping all files');
        dispatch(addedStatusMessage(`Finished copying and ${'\n'}unzipping all files`));
        progress = await moveFiles(dataFile);
        console.log('fileCount', progress);
        dispatch(addedCustomMapsFromBackup(otherMapsDb));
        dispatch(addedMapsFromDevice({mapType: 'offlineMaps', maps: mapNamesDb}));
        dispatch(addedStatusMessage('Finished moving tiles'));
      }
      dispatch(addedStatusMessage('Importing image files...'));
      await copyImages(selectedProject.fileName);

      return Promise.resolve({project: dataFile.projectDb.project, progress: progress});
    }
  };

  const copyImages = async (fileName) => {
    try {
      const exists = await RNFS.exists(devicePath + appDirectoryForDistributedBackups + '/'
        + fileName + '/Images');
      if (exists) {
        const imageFiles = await RNFS.readdir(devicePath + appDirectoryForDistributedBackups + '/'
          + fileName + '/Images');
        console.log(imageFiles);
        await useDevice.doesDeviceDirectoryExist(devicePath + imagesDirectory);
        if (!isEmpty(imageFiles)) {
          imageFiles.map(async image => {
            await RNFS.copyFile(devicePath + appDirectoryForDistributedBackups + '/'
              + fileName + '/Images/' + image, devicePath + imagesDirectory + '/' + image);
          });
          dispatch(removedLastStatusMessage());
          dispatch(addedStatusMessage('Finished importing image files.'));
        }
        else {
          dispatch(removedLastStatusMessage());
          dispatch(addedStatusMessage('No image files.'));
        }
      }
    }
    catch (err) {
      console.error('Error checking existance of backup images dir.', err);
    }
  };

  const readDeviceJSONFile = async (fileName) => {
    const dataFile = '/data.json';
    return await RNFS.readFile(devicePath + appDirectoryForDistributedBackups + '/' + fileName + dataFile).then(
      response => {
        return Promise.resolve(JSON.parse(response));
      }, () => Alert.alert('Project Not Found'));
  };

  return {
    copyZipMapsForDistribution: copyZipMapsForDistribution,
    loadProjectFromDevice: loadProjectFromDevice,
    moveFiles: moveFiles,
    readDeviceJSONFile: readDeviceJSONFile,
    unzipFile: unzipFile,

  };
};

export default useImport;
