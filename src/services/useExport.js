import {PermissionsAndroid} from 'react-native';

import RNFS from 'react-native-fs';
import {zip} from 'react-native-zip-archive';
import {useDispatch, useSelector} from 'react-redux';

import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setBackupModalVisible,
  setLoadingStatus,
  setStatusMessagesModalVisible,
} from '../modules/home/home.slice';
import {setSelectedProject} from '../modules/project/projects.slice';
import {isEmpty} from '../shared/Helpers';
import {APP_DIRECTORIES} from './deviceAndAPI.constants';
import useDeviceHook from './useDevice';

const useExport = () => {
  const dispatch = useDispatch();
  const dbs = useSelector(state => state);
  const selectedProject = useSelector(state => state.project.selectedProject);

  const dbsStateCopy = JSON.parse(JSON.stringify(dbs));
  let configDb = {user: dbsStateCopy.user, other_maps: dbsStateCopy.map.customMaps};

  const useDevice = useDeviceHook();
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
    await useDevice.writeFileToDevice(directory, filename, data);
  };

  // For Android only.
  const exportJSONToDownloadsFolder = async (localFileName, filename, isBeingExported) => {
    dispatch(clearedStatusMessages());
    dispatch(setLoadingStatus({view: 'modal', bool: true}));
    await useDevice.makeDirectory(APP_DIRECTORIES.EXPORT_FILES_ANDROID + filename);

    // Make temp directory for the export files to be zipped up.
    console.log('Directory made:', APP_DIRECTORIES.EXPORT_FILES_ANDROID);

    // const dateAndTime = moment(new Date()).format('YYYY-MM-DD_hmma');
    const source = APP_DIRECTORIES.BACKUP_DIR + localFileName + '/data.json';
    const destination = APP_DIRECTORIES.EXPORT_FILES_ANDROID + filename;
    await requestWriteDirectoryPermission();
    console.log(localFileName);

    const file = await RNFS.readFile(APP_DIRECTORIES.BACKUP_DIR + localFileName + '/data.json');
    const exportedJSON = JSON.parse(file);
    try {
      await RNFS.copyFile(source, `${destination}/data.json`);
      console.log('Files Copied');
      // console.log('ANDROID', await RNFS.readFile(destination + '/data.json'));
      await gatherImagesForDistribution(exportedJSON, filename, isBeingExported);
      console.log('Images copied to:', destination);
      await gatherMapsForDistribution(exportedJSON, filename, isBeingExported);
      console.log('Map tiles copied to:', destination);

      const path = await zip(APP_DIRECTORIES.EXPORT_FILES_ANDROID + filename,
        APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID + filename + '.zip');
      console.log(`zip completed at ${path}`);
      console.log('All Done Exporting');
    }
    catch (err) {
      console.error('ERROR', err);
      // handle error- filename name must be unique.
    }
  };

  const gatherDataForBackup = async (filename) => {
    try {
      dispatch(addedStatusMessage('Exporting Project Data...'));
      console.log(dataForExport);

      await exportData(APP_DIRECTORIES.BACKUP_DIR + filename, dataForExport,
        'data.json');
      console.log('Finished Exporting Project Data', dataForExport);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished Exporting Project Data'));
    }
    catch (err) {
      console.error('Error Exporting Data!', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Exporting Project Data.' + err));
    }
  };

  const gatherImagesForDistribution = async (data, fileName, isBeingExported) => {
    try {
      const deviceDir = isBeingExported ? APP_DIRECTORIES.EXPORT_FILES_ANDROID : APP_DIRECTORIES.BACKUP_DIR;
      console.log('data:', data);
      await useDevice.doesDeviceDirectoryExist(
        deviceDir + fileName + '/Images');
      dispatch(addedStatusMessage('Exporting Images...'));
      if (data.spotsDb) {
        console.log('Spots Exist!');
        await Promise.all(
          Object.values(data.spotsDb).map(async (spot) => {
            if (spot.properties.images) {
              console.log('Spot with images', spot.properties.name, 'Images:', spot.properties.images);
              await Promise.all(
                spot.properties.images.map(async (image) => {
                  await moveDistributedImage(image.id, fileName, deviceDir);
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
      console.error('Error Backing Up Images!', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Exporting Images!' + err));
    }
  };


  const gatherMapsForDistribution = async (data, fileName, isBeingExported) => {
    try {
      const maps = data.mapNamesDb;
      const mapCount = Object.values(maps).length;
      const deviceDir = isBeingExported ? APP_DIRECTORIES.EXPORT_FILES_ANDROID : APP_DIRECTORIES.BACKUP_DIR;
      let promises = [];
      dispatch(addedStatusMessage('Exporting Offline Maps...'));
      if (!isEmpty(maps)) {
        console.log('Maps exist.', maps);
        await useDevice.doesDeviceDirectoryExist(
          deviceDir + fileName + '/maps');
        await Promise.all(
          Object.values(maps).map(async (map) => {
            const mapId = await moveDistributedMap(map.mapId, fileName, deviceDir);
            console.log('Moved map:', mapId);
            promises.push(mapId);
            console.log(promises);
          }),
        );
        console.log('Promised Finished');
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage(`Finished Exporting ${mapCount} Offline Map${mapCount > 1 ? 's' : ''}.`));
      }
      else {
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage('No offline maps to export.'));
      }
    }
    catch (err) {
      console.error('Error Exporting Offline Maps.');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Exporting Offline Maps!' + err));
    }
  };

  const gatherOtherMapsForDistribution = async (exportedFileName) => {
    try {
      console.log(configDb);
      dispatch(addedStatusMessage('Exporting Custom Maps...'));
      if (!isEmpty(configDb.other_maps)) {
        await exportData(APP_DIRECTORIES.BACKUP_DIR + exportedFileName, configDb.other_maps,
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
      dispatch(addedStatusMessage('Error Exporting Custom Maps!' + err));
    }
  };

  const initializeBackup = async (fileName) => {
    try {
      dispatch(setSelectedProject({
        ...selectedProject,
        project: {
          fileName: fileName,
        },
      }));
      dispatch(setBackupModalVisible(false));
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Backing up Project to Device...'));
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(setStatusMessagesModalVisible(true));
      const hasBackupDir = await useDevice.doesDeviceBackupDirExist();
      console.log('Has Backup Dir?: ', hasBackupDir);
      if (hasBackupDir) await backupProjectToDevice(fileName);
      else {
        await useDevice.makeDirectory(APP_DIRECTORIES.BACKUP_DIR);
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

  const moveDistributedImage = async (image_id, fileName, directory) => {
    try {
      const imageExists = await useDevice.doesDeviceFileExist(image_id, '.jpg');
      if (imageExists) {
        await useDevice.copyFiles(APP_DIRECTORIES.IMAGES + image_id + '.jpg',
          directory + fileName + '/Images/' + image_id + '.jpg');
        imageSuccess++;
      }
    }
    catch (err) {
      imageBackupFailures++;
      console.log('ERROR', err.toString());
    }
  };

  const moveDistributedMap = async (mapId, fileName, directory) => {
    console.log('Moving Map:', mapId);
    return RNFS.exists(APP_DIRECTORIES.TILE_ZIP + mapId + '.zip')
      .then((exists) => {
        if (exists) {
          console.log(mapId + '.zip exists?', exists);
          return RNFS.copyFile(APP_DIRECTORIES.TILE_ZIP + mapId + '.zip',
            directory + fileName + '/maps/' + mapId.toString() + '.zip').then(
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
      .catch((err) => {
        console.warn('Error moving maps in useExport', err);
      });
  };

  const requestWriteDirectoryPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Need permission to read Downloads Folder',
          message:
            'StraboSpot2 needs permission to access your Downloads Folder to save backups,',
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

  return {
    backupProjectToDevice: backupProjectToDevice,
    exportJSONToDownloadsFolder: exportJSONToDownloadsFolder,
    initializeBackup: initializeBackup,
  };
};

export default useExport;
