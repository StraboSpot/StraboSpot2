import {useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';

import {zip} from 'react-native-zip-archive';
import {useDispatch, useSelector} from 'react-redux';

import {APP_DIRECTORIES} from './directories.constants';
import useDeviceHook from './useDevice';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setBackupModalVisible,
  setLoadingStatus,
  setStatusMessagesModalVisible,
} from '../modules/home/home.slice';
import {setBackupFileName} from '../modules/project/projects.slice';
import {isEmpty} from '../shared/Helpers';

const useExport = () => {
  const dispatch = useDispatch();
  const backupFileName = useSelector(state => state.project.backupFileName);
  const mapNamesDb = useSelector(state => state.offlineMap.offlineMaps);
  const otherMapsDb = useSelector(state => state.map.customMaps);
  const projectDb = useSelector(state => state.project);
  const spotsDb = useSelector(state => state.spot.spots);
  const userDb = useSelector(state => state.user);

  const appExportDirectory = Platform.OS === 'ios' ? APP_DIRECTORIES.EXPORT_FILES_IOS : APP_DIRECTORIES.EXPORT_FILES_ANDROID;

  const otherMapsDbCopy = JSON.parse(JSON.stringify(otherMapsDb));
  const userDbCopy = JSON.parse(JSON.stringify(userDb));
  const configDb = {user: userDbCopy, other_maps: otherMapsDbCopy};

  const useDevice = useDeviceHook();
  let imageBackupFailures = 0;
  let imageSuccess = 0;

  useEffect(() => {
    console.log(backupFileName);
  }, [backupFileName]);

  let dataForExport = {
    mapNamesDb: mapNamesDb,
    mapTilesDb: {},
    otherMapsDb: otherMapsDb,
    projectDb: projectDb,
    spotsDb: spotsDb,
  };

  const backupProjectToDevice = async (exportedFileName) => {
    await gatherDataForBackup(exportedFileName);
    console.log('Finished Exporting Project Data');
    await gatherOtherMapsForDistribution(exportedFileName);
    console.log('Other Maps Exported');
    await gatherMapsForDistribution(dataForExport, exportedFileName);
    console.log('Maps tiles have been exported.');
    await gatherImagesForDistribution(dataForExport, exportedFileName);
    console.log('Images Resolve Message:');
  };

  const exportData = async (directory, data, filename) => {
    await useDevice.doesDeviceDirectoryExist(directory);
    await useDevice.writeFileToDevice(directory, filename, data);
  };

  // For Android only.

  const gatherDataForBackup = async (filename) => {
    try {
      dispatch(addedStatusMessage('Exporting Project Data...'));
      console.log(dataForExport);

      await exportData(APP_DIRECTORIES.BACKUP_DIR + filename, dataForExport,
        'data.json');
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
      const deviceDir = isBeingExported ? appExportDirectory : APP_DIRECTORIES.BACKUP_DIR;
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
      const deviceDir = isBeingExported ? appExportDirectory : APP_DIRECTORIES.BACKUP_DIR;
      let promises = [];
      dispatch(addedStatusMessage('Exporting Offline Maps...'));
      if (!isEmpty(maps)) {
        console.log('Maps exist.', maps);
        await useDevice.doesDeviceDirectoryExist(deviceDir + fileName + '/maps');
        await zip(APP_DIRECTORIES.TILE_CACHE, deviceDir + fileName + '/maps/OfflineTiles.zip');
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

  const gatherOtherMapsForDistribution = async (exportedFileName, isBeingExported) => {
    try {
      console.log(configDb);
      const deviceDir = isBeingExported ? appExportDirectory : APP_DIRECTORIES.BACKUP_DIR;
      dispatch(addedStatusMessage('Exporting Custom Maps...'));
      if (!isEmpty(configDb.other_maps)) {
        await exportData(deviceDir + exportedFileName, configDb.other_maps,
          '/other_maps.json');
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
      // dispatch(setSelectedProject({
      //   ...selectedProject,
      //   project: {
      //     fileName: fileName,
      //   },
      // }));
      dispatch(setBackupFileName(fileName));

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
      const imageExists = await useDevice.doesDeviceDirExist(APP_DIRECTORIES.IMAGES + image_id + '.jpg');
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
    return useDevice.doesDeviceDirExist(APP_DIRECTORIES.TILE_ZIP + mapId + '.zip')
      .then((exists) => {
        if (exists) {
          console.log(mapId + '.zip exists?', exists);
          return useDevice.copyFiles(APP_DIRECTORIES.TILE_ZIP + mapId + '.zip',
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

  const zipAndExportProjectFolder = async (isBeingExported) => {
    dispatch(setLoadingStatus({view: 'modal', bool: true}));
    await useDevice.makeDirectory(appExportDirectory + backupFileName);

    // Make temp directory for the export files to be zipped up.
    console.log('Directory made:', appExportDirectory);

    // const dateAndTime = moment(new Date()).format('YYYY-MM-DD_hmma');
    const source = APP_DIRECTORIES.BACKUP_DIR + backupFileName + '/data.json';
    const destination = appExportDirectory + backupFileName;
    Platform.OS === 'android' && await requestWriteDirectoryPermission();
    console.log(backupFileName);

    const file = await useDevice.readFile(APP_DIRECTORIES.BACKUP_DIR + backupFileName + '/data.json');
    const exportedJSON = JSON.parse(file);
    await useDevice.copyFiles(source, `${destination}/data.json`);
    console.log('Files Copied', exportedJSON);
    dispatch(removedLastStatusMessage());

    console.log('DEST', await useDevice.readFile(destination + '/data.json'));
    await gatherImagesForDistribution(exportedJSON, backupFileName, isBeingExported);
    console.log('Images copied to:', destination);
    await gatherMapsForDistribution(exportedJSON, backupFileName, isBeingExported);
    console.log('Map tiles copied to:', destination);
    await gatherOtherMapsForDistribution(backupFileName, isBeingExported);
    const zipPath = Platform.OS === 'ios' ? APP_DIRECTORIES.EXPORT_FILES_IOS : APP_DIRECTORIES.DOWNLOAD_DIR_ANDROID;
    const path = await zip(appExportDirectory + backupFileName,
      zipPath + backupFileName + '.zip');

    const deleteTempFolder = useDevice.deleteFromDevice(appExportDirectory, backupFileName);
    console.log('Folder', deleteTempFolder);
    console.log(`zip completed at ${path}`);
    console.log('All Done Exporting');
  };

  return {
    backupProjectToDevice: backupProjectToDevice,
    initializeBackup: initializeBackup,
    zipAndExportProjectFolder: zipAndExportProjectFolder,
  };
};

export default useExport;
