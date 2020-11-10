import {Alert, Platform} from 'react-native';

import {useDispatch, useSelector, batch} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import useServerRequests from '../../services/useServerRequests';
import {getNewId, isEmpty} from '../../shared/Helpers';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setInfoMessagesModalVisible,
  setStatusMessagesModalVisible,
} from '../home/home.slice';
import {addedMapsFromDevice, clearedMaps} from '../maps/maps.slice';
import {addedSpotsFromDevice, clearedSpots} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import {DEFAULT_GEOLOGIC_TYPES, DEFAULT_RELATIONSHIP_TYPES} from './project.constants';
import {
  addedDataset,
  addedProject,
  addedProjectDescription,
  clearedDatasets,
  clearedProject,
  deletedDataset,
  setActiveDatasets,
  setSelectedDataset,
} from './projects.slice';
import useDownloadHook from './useDownload';
import useImportHook from './useImport';
import useDeviceHook from '../../services/useDevice';

const useProject = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';
  const appDirectoryTiles = '/StraboSpotTiles';
  const zipsDirectory = appDirectoryTiles + '/TileZips';

  const dispatch = useDispatch();
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const datasets = useSelector(state => state.project.datasets);
  const project = useSelector(state => state.project.project);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);
  const user = useSelector(state => state.user);
  const isOnline = useSelector(state => state.home.isOnline);

  const useImport = useImportHook();
  const [serverRequests] = useServerRequests();
  const [useSpots] = useSpotsHook();
  const useDownload = useDownloadHook();
  const useDevice = useDeviceHook()

  const addDataset = async name => {
    const datasetObj = createDataset(name);
    await dispatch(addedDataset(datasetObj));
    console.log('Added datasets', datasets);
    // await makeDatasetCurrent(datasetObj);
    return Promise.resolve();
  };

  const checkValidDateTime = (spot) => {
    if (!spot.properties.date || !spot.properties.time) {
      let date = spot.properties.date || spot.properties.time;
      if (!date) {
        date = new Date(Date.now());
        date.setMilliseconds(0);
      }
      spot.properties.date = spot.properties.time = date.toISOString();
      console.log('SPOT', spot);
      return spot;
    }
  };

  const copyZipMapsForDistribution = (fileName) => {
    return new Promise(async (resolve, reject) => {
      RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups + '/' + fileName + '/maps').then(exists => {
        console.log('Dir exists', exists);
        if (exists) {
          doesAppDirExist(appDirectoryTiles).then(res => {
            if (res) {
              doesAppDirExist(zipsDirectory).then(res => {
                if (res) {
                  RNFetchBlob.fs.ls(devicePath + zipsDirectory).then(files => {
                    console.log('files', files);
                    resolve();
                  });
                  // resolve();
                }
                else resolve(zipsDirectory, 'does NOT exist.');
              });
            }
            else resolve(appDirectoryTiles, 'does NOT exist.');
          });
        }
        else resolve('Maps directory not found.');
      })
        .catch(err => {
          console.log('ERROR checking directory', err);
        });
    });
  };

  const createDataset = (name) => {
    const newDate = new Date().toISOString();
    const modifiedTimeStamp = Date.now();
    const id = getNewId();
    return {
      id: id,
      name: name ? name : 'Default',
      date: newDate,
      modified_timestamp: modifiedTimeStamp,
      current: true,
      active: true,
    };
  };

  const createProject = async (descriptionData) => {
    const newDate = new Date().toISOString();
    const id = getNewId();
    const currentProject = {
      id: id,
      description: descriptionData,
      date: newDate,
      modified_timestamp: Date.now(),
      other_features: DEFAULT_GEOLOGIC_TYPES,
      relationship_types: DEFAULT_RELATIONSHIP_TYPES,
    };
    dispatch(addedProjectDescription(currentProject));
    const defaultDataset = await createDataset();
    dispatch(addedDataset(defaultDataset));
  };

  const destroyDataset = (id) => {
    let spotsDeletedCount = 0;
    if (datasets && datasets[id] && datasets[id].spotIds) {
      return Promise.all(datasets[id].spotIds.map(spotId => {
          console.log('SpotIds', spotId);
          useSpots.deleteSpotsFromDataset(datasets[id], spotId).then((spotIdsArr) => {
            spotsDeletedCount++;
            console.log(spotId, 'Current Spot Deleted Count:', spotsDeletedCount);
            console.log('DeleteSpot()', spotIdsArr);
            if (isEmpty(spotIdsArr)) {
              dispatch(removedLastStatusMessage());
              dispatch(addedStatusMessage({statusMessage: `Deleted ${spotsDeletedCount} spots.`}));
              dispatch(deletedDataset(id));
              dispatch(addedStatusMessage({statusMessage: 'Dataset Deleted!'}));
            }
          });
        }),
      );
    }
    else {
      dispatch(deletedDataset(id));
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Dataset Deleted!'}));
      return Promise.resolve();
    }
  };

  const destroyOldProject = () => {
    batch(() => {
      dispatch(clearedProject());
      dispatch(clearedSpots());
      dispatch(clearedDatasets());
      dispatch(clearedMaps());
    });
    console.log('Destroy batch complete');
  };

  const doesAppDirExist = async (subDirectory) => {
    return await RNFetchBlob.fs.isDir(devicePath + subDirectory);
  };

  const doesDeviceBackupDirExist = async (subDirectory) => {
    if (subDirectory !== undefined) {
      return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups + '/' + subDirectory);
    }
    else return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups);
  };

  const initializeNewProject = async (descriptionData) => {
    await destroyOldProject();
    await createProject(descriptionData);
    return Promise.resolve();
  };

  const getAllDeviceProjects = async () => {
    const deviceProject = await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups).then(res => {
      console.log('/StraboProjects exists:', res);
      if (res) {
        return RNFetchBlob.fs.ls(devicePath + appDirectoryForDistributedBackups).then(files => {
          let id = 0;
          if (!isEmpty(files)) {
            const deviceFiles = files.map(file => {
              return {id: id++, fileName: file};
            });
            return Promise.resolve({projects: deviceFiles});
          }
          else return Promise.resolve([]);
        });
      }
      else return res;
    });
    return Promise.resolve(deviceProject);
  };

  const getAllServerProjects = async () => {
    try {
      return await serverRequests.getMyProjects(user.encoded_login);
    }
    catch (err) {
      return err.ok;
    }
  };

  const getSelectedDatasetFromId = () => {
    return datasets[selectedDatasetId];
  };

  // const loadProjectFromDevice = async (selectedProject) => {
  //   console.log('SELECTED PROJECT', selectedProject);
  //   const {projectDb, spotsDb, otherMapsDb, mapNamesDb} = selectedProject;
  //   const dirExists = await doesDeviceBackupDirExist();
  //   console.log(dirExists);
  //   if (dirExists) {
  //     if (!isEmpty(project)) destroyOldProject();
  //     dispatch(addedSpotsFromDevice(spotsDb));
  //     dispatch(addedProject(projectDb.project));
  //     await getDatasets(projectDb, 'device');
  //     if (!isEmpty(otherMapsDb) || !isEmpty(mapNamesDb)) {
  //       dispatch(addedMapsFromDevice({mapType: 'customMaps', maps: otherMapsDb}));
  //       dispatch(addedMapsFromDevice({mapType: 'offlineMaps', maps: mapNamesDb}));
  //     }
  //     return Promise.resolve(selectedProject.projectDb.project);
  //   }
  // };

  const makeDatasetCurrent = (dataset) => {
    dispatch(setSelectedDataset(dataset));
    return Promise.resolve();
  };

  // const readDeviceFile = async (selectedProject) => {
  //   let data = selectedProject.fileName;
  //   const dataFile = '/data.json';
  //   return await RNFetchBlob.fs.readFile(devicePath + appDirectoryForDistributedBackups + '/' + data + dataFile).then(
  //     response => {
  //       return Promise.resolve(JSON.parse(response));
  //     }, () => Alert.alert('Project Not Found'));
  // };

  const selectProject = async (selectedProject, source) => {
    try {
      console.log('Getting project...');
      if (!isEmpty(project)) destroyOldProject();
      if (source === 'device') {
        const dataFile = await useImport.readDeviceFile(selectedProject);
        if (!isEmpty(dataFile.mapNamesDb) || !isEmpty(dataFile.otherMapsDb)) {
          await copyZipMapsForDistribution(selectedProject.fileName);
          // await useDevice.doesDeviceDirectoryExist(devicePath + appDirectoryForDistributedBackups + '/' + selectedProject.fileName + '/maps');
          // console.log('Maps Dir Exists? ', doMapsDirExists, '!');
        }
        return useImport.loadProjectFromDevice(dataFile).then((data) => {

          return data;
        });
      }
      else {
        dispatch(clearedStatusMessages());
        dispatch(setStatusMessagesModalVisible(true));
        await useDownload.initializeDownload(selectedProject, source);
      }
    }
    catch (err) {
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage({
        statusMessage: `There is not a project named: 
          \n\n${selectedProject.description.project_name}\n\n on the server...`,
      }));
      dispatch(setInfoMessagesModalVisible(true));
      throw err.ok;
    }
  };

  // Upload Dataset Properties
  const setSwitchValue = async (val, dataset) => {
    const areActiveDatasetsEmpty = isEmpty(activeDatasetsIds);

    if (isOnline && !isEmpty(user) && val) {

      dispatch(setActiveDatasets({bool: val, dataset: dataset.id}));
      dispatch(setSelectedDataset(dataset.id));
      if (isEmpty(dataset.spotIds)) {
        dispatch(setStatusMessagesModalVisible(true));
        dispatch(clearedStatusMessages());
        const res = await useDownload.downloadSpots(dataset, user.encoded_login);
        if (res === 'No Spots!') {
          dispatch(addedStatusMessage({statusMessage: 'No Spots!'}));
          dispatch(addedStatusMessage({statusMessage: 'Download Complete!'}));
        }
        else dispatch(addedStatusMessage({statusMessage: 'Download Complete!'}));
      }
      // if (val && areActiveDatasetsEmpty) dispatch(setSelectedDataset(dataset.id));
      return Promise.resolve();
    }
    else {
      dispatch(setActiveDatasets({bool: val, dataset: dataset.id}));
    }
    return Promise.resolve();
  };

  const projectHelpers = {
    addDataset: addDataset,
    checkValidDateTime: checkValidDateTime,
    createProject: createProject,
    destroyDataset: destroyDataset,
    destroyOldProject: destroyOldProject,
    doesDeviceBackupDirExist: doesDeviceBackupDirExist,
    getAllDeviceProjects: getAllDeviceProjects,
    getAllServerProjects: getAllServerProjects,
    getSelectedDatasetFromId: getSelectedDatasetFromId,
    makeDatasetCurrent: makeDatasetCurrent,
    initializeNewProject: initializeNewProject,
    // loadProjectFromDevice: loadProjectFromDevice,
    // readDeviceFile: readDeviceFile,
    selectProject: selectProject,
    setSwitchValue: setSwitchValue,
  };

  return [projectHelpers];
};

export default useProject;
