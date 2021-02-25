import RNFS from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import {isEmpty} from '../../shared/Helpers';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage, setBackupModalVisible,
  setLoadingStatus, setStatusMessagesModalVisible,
} from '../home/home.slice';
import useProjectHook from './useProject';

const useExport = () => {
  const devicePath = RNFS.DocumentDirectoryPath;
  const appDirectoryTiles = '/StraboSpotTiles';
  const appDirectoryForDistributedBackups = '/ProjectBackups';
  const appDirectory = '/StraboSpot';
  const imagesDirectory = appDirectory + '/Images';
  const zipsDirectory = appDirectoryTiles + '/TileZips';

  const dispatch = useDispatch();
  const dbs = useSelector(state => state);

  const [useProject] = useProjectHook();

  const dbsStateCopy = JSON.parse(JSON.stringify(dbs));
  let configDb = {user: dbsStateCopy.user, other_maps: dbsStateCopy.map.customMaps};

  const useDevice = useDeviceHook();
  let imageCount = 0;
  let imageBackupFailures = 0;
  let imageSuccess = 0;

  let dataForExport = {
    mapNamesDb: dbs.offlineMap.offlineMaps,
    mapTilesDb: {},
    otherMapsDb: dbs.map.customMaps,
    projectDb: dbs.project,
    spotsDb: dbs.spot.spots,
  };

  const backupProjectToDevice = async (exportedFileName) => {
    await gatherDataForBackup(exportedFileName);
    await gatherOtherMapsForDistribution(exportedFileName);
    await gatherMapsForDistribution(dataForExport, exportedFileName);
    await gatherImagesForDistribution(dataForExport, exportedFileName);
    console.log('Images Resolve Message:');
  };

  const exportData = async (directory, data, filename) => {
    await useDevice.doesDeviceDirectoryExist(directory);
    const res = await useDevice.writeFileToDevice(directory, filename, data);
    console.log(res);
  };

  const getActiveDatasets = () => {
    const activeDatasets = useProject.getActiveDatasets();
    dataForExport.projectDb = {
      ...dataForExport.projectDb,
      datasets: Object.assign({}, ...activeDatasets.map(dataset => ({[dataset.id]: dataset}))),
    };
  };

  const gatherDataForBackup = async (filename) => {
    try {
      getActiveDatasets();
      dispatch(addedStatusMessage('Exporting Project Data...'));
      console.log(dataForExport);
      await exportData(devicePath + appDirectoryForDistributedBackups + '/' + filename, dataForExport,
        'data.json');
      console.log('Finished Exporting Project Data', dataForExport);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished Exporting Project Data'));
    }
    catch (err) {
      console.error('Error Exporting Data!', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Exporting Project Data.'));
    }
  };

  const gatherImagesForDistribution = async (data, fileName) => {
    try {
      console.log('data:', data);
      await useDevice.doesDeviceDirectoryExist(
        devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/Images');
      dispatch(addedStatusMessage('Exporting Images...'));
      if (data.spotsDb) {
        console.log('Spots Exist!');
        await Promise.all(
          Object.values(data.spotsDb).map(async spot => {
            if (spot.properties.images) {
              console.log('Spot with images', spot.properties.name, 'Images:', spot.properties.images);
              await Promise.all(
                spot.properties.images.map(async image => {
                  await moveDistributedImage(image.id, fileName);
                  console.log('Moved file:', image.id);
                }),
              );
            }
          }),
        );
        console.log('Image Promises Finished ');
        dispatch(removedLastStatusMessage());
        if (imageBackupFailures > 0) {
          dispatch(addedStatusMessage(
            `Images backed up: ${imageSuccess}.\nImages NOT backed up: ${imageBackupFailures}.`,
          ));
        }
        else dispatch(addedStatusMessage(`${imageSuccess} Images backed up.`));
      }
    }
    catch (err) {
      console.error('Error Backing Up Images!');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Exporting Images!'));
    }
  };


  const gatherMapsForDistribution = async (data, fileName) => {
    try {
      const maps = data.mapNamesDb;
      let promises = [];
      dispatch(addedStatusMessage('Exporting Offline Maps...'));
      if (!isEmpty(maps)) {
        console.log('Maps exist.', maps);
        await useDevice.doesDeviceDirectoryExist(
          devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/maps');
        await Promise.all(
          Object.values(maps).map(async map => {
            const mapId = await moveDistributedMap(map.mapId, fileName);
            console.log('Moved map:', mapId);
            promises.push(mapId);
            console.log(promises);
          }),
        );
        console.log('Promised Finished');
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage('Finished Exporting Offline Maps.'));
      }
      else {
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage('No offline maps to export.'));
      }
    }
    catch (err) {
      console.error('Error Exporting Offline Maps.');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Exporting Offline Maps!'));
    }
  };

  const gatherOtherMapsForDistribution = async (exportedFileName) => {
    try {
      console.log(configDb);
      dispatch(addedStatusMessage('Exporting Custom Maps...'));
      if (!isEmpty(configDb.other_maps)) {
        await exportData(devicePath + appDirectoryForDistributedBackups + '/' + exportedFileName, configDb.other_maps,
          '/other_maps.json');
        console.log('Other Maps Exported');
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage('Finished Exporting Custom Maps.'));
      }
      else {
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage('No custom maps to export.'));
      }
    }
    catch (err) {
      console.error('Error Exporting Other Maps', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Exporting Custom Maps!'));
    }
  };

  const initializeBackup = async (fileName) => {
    try {
      dispatch(setBackupModalVisible(false));
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Backing up Project to Device...'));
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(setStatusMessagesModalVisible(true));
      const hasBackupDir = await useDevice.doesDeviceBackupDirExist(devicePath + appDirectoryForDistributedBackups);
      console.log('Has Backup Dir?: ', hasBackupDir);
      if (hasBackupDir) await backupProjectToDevice(fileName);
      else {
        await useDevice.makeDirectory(appDirectoryForDistributedBackups);
        await backupProjectToDevice(fileName);
      }
      dispatch(addedStatusMessage('---------------'));
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      dispatch(addedStatusMessage('Project Backup Complete!'));
    }
    catch (err) {
      console.error('Error Backing Up Project!: ', err);
    }
  };

  const moveDistributedImage = async (image_id, fileName) => {
    try {
      const imageExists = await useDevice.doesDeviceFileExist(image_id, '.jpg');
      if (imageExists) {
        imageCount++;
        await useDevice.copyFiles(devicePath + imagesDirectory + '/' + image_id + '.jpg',
          devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/Images/' + image_id + '.jpg');
        imageSuccess++;
      }
    }
    catch (err) {
      imageBackupFailures++;
      console.log('ERROR', err.toString());
    }
  };

  const moveDistributedMap = async (mapId, fileName) => {
    console.log('Moving Map:', mapId);
    return RNFS.exists(devicePath + zipsDirectory + '/' + mapId + '.zip')
      .then(exists => {
        if (exists) {
          console.log(mapId + '.zip exists?', exists);
          return RNFS.copyFile(devicePath + zipsDirectory + '/' + mapId + '.zip',
            devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/maps/' + mapId.toString() + '.zip').then(
            () => {
              console.log('Map Copied.');
              return Promise.resolve(mapId);
            });
        }
        else {
          console.log('couldn\'t find map ' + mapId + '.zip');
          return Promise.resolve();
        }
      })
      .catch(err => {
        console.warn(err);
      });
  };

  return {
    backupProjectToDevice: backupProjectToDevice,
    initializeBackup: initializeBackup,
  };
};

export default useExport;
