import {Alert, Platform} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import useServerRequests from '../../services/useServerRequests';
import {getNewId, isEmpty} from '../../shared/Helpers';
import {homeReducers} from '../home/home.constants';
import useImagesHook from '../images/useImages';
import {mapReducers} from '../maps/maps.constants';
import {spotReducers} from '../spots/spot.constants';
import useSpotsHook from '../spots/useSpots';
import {projectReducers} from './project.constants';

const useProject = () => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';
  const appDirectoryTiles = '/StraboSpotTiles';
  const zipsDirectory = appDirectoryTiles + '/TileZips';

  const dispatch = useDispatch();
  const datasets = useSelector(state => state.project.datasets);
  const project = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);

  const [serverRequests] = useServerRequests();
  const [useImages] = useImagesHook();
  const [useSpots] = useSpotsHook();

  const defaultTypes = ['geomorphic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
    'other'];
  const defaultRelationshipTypes = ['cross-cuts', 'mutually cross-cuts', 'is cut by', 'is younger than', 'is older than',
    'is lower metamorphic grade than', 'is higher metamorphic grade than', 'is included within', 'includes',
    'merges with'];

  const addDataset = async name => {
    const addedDataset = createDataset(name);
    await dispatch({type: projectReducers.DATASETS.DATASET_ADD, dataset: addedDataset});
    await makeDatasetCurrent(addedDataset.id);
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
    const id = getNewId();
    return {
      id: id,
      name: name ? name : 'Default',
      date: new Date(),
      modified_timestamp: Date.now(),
      current: true,
      active: true,
    };
  };

  const createProject = async (descriptionData) => {
    const id = getNewId();
    const currentProject = {
      id: id,
      description: descriptionData,
      date: new Date(),
      modified_timestamp: Date.now(),
      other_features: defaultTypes,
      relationship_types: defaultRelationshipTypes,
    };
    dispatch({type: projectReducers.PROJECT_ADD, description: currentProject});
    const defaultDataset = await createDataset();
    dispatch({type: projectReducers.DATASETS.DATASET_ADD, dataset: defaultDataset});
  };

  const initializeNewProject = async (descriptionData) => {
    await destroyOldProject();
    await createProject(descriptionData);
    return Promise.resolve();
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
              dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
              dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: `Deleted ${spotsDeletedCount} spots.`});
              dispatch({type: projectReducers.DATASETS.DATASET_DELETE, id: id});
              dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Dataset Deleted!'});
            }
          });
        }),
      );
    }
    else {
      dispatch({type: projectReducers.DATASETS.DATASET_DELETE, id: id});
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Dataset Deleted!'});
      return Promise.resolve();
    }
  };

  const destroyOldProject = async () => {
    // if (!isEmpty(project)) {
    await dispatch({type: projectReducers.PROJECT_CLEAR});
    await dispatch({type: spotReducers.CLEAR_SPOTS});
    await dispatch({type: projectReducers.DATASETS.DATASETS_CLEAR});
    await dispatch({type: mapReducers.CLEAR_MAPS});
    // }
    return Promise.resolve();
  };

  const doesAppDirExist = async (subDirectory) => {
    return await RNFetchBlob.fs.isDir(devicePath + subDirectory);
  };

  const doesDeviceDirExist = async (subDirectory) => {
    if (subDirectory !== undefined) {
      return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups + '/' + subDirectory);
    }
    else return await RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups);
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

  const getCurrentDataset = () => {
    return Object.values(datasets).find(dataset => dataset.current);
  };

  const loadProjectFromDevice = async (selectedProject) => {
    console.log('SELECTED PROJECT', selectedProject);
    const {projectDb, spotsDb, otherMapsDb, mapNamesDb} = selectedProject;
    const dirExists = await doesDeviceDirExist();
    console.log(dirExists);
    if (dirExists) {
      if (!isEmpty(project)) await destroyOldProject();
      dispatch({type: spotReducers.ADD_SPOTS_FROM_DEVICE, spots: spotsDb});
      dispatch({type: projectReducers.PROJECTS, project: projectDb.project});
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: projectDb.datasets});
      if (!isEmpty(otherMapsDb) || !isEmpty(mapNamesDb)) {
        dispatch({type: mapReducers.ADD_MAPS_FROM_DEVICE, field: 'customMaps', maps: otherMapsDb});
        dispatch({type: mapReducers.ADD_MAPS_FROM_DEVICE, field: 'offlineMaps', maps: mapNamesDb});
      }
      return Promise.resolve(selectedProject.projectDb.project);
    }
  };

  const loadProjectRemote = async (selectedProject) => {
    dispatch({
      type: homeReducers.ADD_STATUS_MESSAGE,
      statusMessage: `Getting project: ${selectedProject.name}\n from server...\n ---------------`,
    });
    console.log(`Getting ${selectedProject.name} project from server...`);
    if (!isEmpty(project)) await destroyOldProject();
    try {
      const projectResponse = await serverRequests.getProject(selectedProject.id, user.encoded_login);
      console.log('Loaded Project:', projectResponse);
      if (!projectResponse.description) projectResponse.description = {};
      if (!projectResponse.description.project_name) projectResponse.description.project_name = 'Unnamed';
      if (!projectResponse.other_features) projectResponse.other_features = defaultTypes;
      await dispatch({type: projectReducers.PROJECTS, project: projectResponse});
      if (projectResponse.other_maps) {
      }
      const datasetsResponse = await getDatasets(selectedProject);
      if (datasetsResponse.datasets.length === 1) {
        await useSpots.downloadSpots(datasetsResponse.datasets[0], user.encoded_login);
      }
      return Promise.resolve(projectResponse);
    }
    catch (err) {
      console.log(err);
      return err;
    }
  };

  const getDatasets = async (project) => {
    dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Getting datasets from server...'});
    const projectDatasetsFromServer = await serverRequests.getDatasets(project.id, user.encoded_login);
    if (projectDatasetsFromServer === 401) {
      return Promise.reject();
    }
    else {
      if (projectDatasetsFromServer.datasets.length === 1) {
        projectDatasetsFromServer.datasets[0].active = true;
        projectDatasetsFromServer.datasets[0].current = true;
      }
      else {
        projectDatasetsFromServer.datasets.map(dataset => {
          dataset.active = false;
        });
      }
      const datasetsReassigned = Object.assign({},
        ...projectDatasetsFromServer.datasets.map(item => ({[item.id]: item})));
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasetsReassigned});
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Datasets Saved.'});
      console.log('Saved datasets:', projectDatasetsFromServer);
      return Promise.resolve(projectDatasetsFromServer);
    }
  };

  const makeDatasetCurrent = (id) => {
    // eslint-disable-next-line no-return-assign
    Object.values(datasets).map(data => data.current = false);
    const datasetsCopy = JSON.parse(JSON.stringify(datasets));
    datasetsCopy[id].current = !datasetsCopy[id].current;
    dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasetsCopy});
    return Promise.resolve();
  };

  const readDeviceFile = async (selectedProject) => {
    let data = selectedProject.fileName;
    const dataFile = '/data.json';
    return await RNFetchBlob.fs.readFile(devicePath + appDirectoryForDistributedBackups + '/' + data + dataFile).then(
      response => {
        return Promise.resolve(JSON.parse(response));
      }, () => Alert.alert('Project Not Found'));
  };

  const selectProject = async (selectedProject, source) => {
    console.log('Getting project...');
    let projectResponse = null;
    if (source === 'device') {
      projectResponse = await readDeviceFile(selectedProject)
        .then(async dataFile => {
          if (!isEmpty(dataFile.mapNamesDb) || !isEmpty(dataFile.otherMapsDb)) {
            const doMapsDirExists = await copyZipMapsForDistribution(selectedProject.fileName);
            console.log(doMapsDirExists, '!');
          }
          return loadProjectFromDevice(dataFile).then((data) => {
            return data;
          });
        });
    }
    else {
      try {
        dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
        dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: true});
        projectResponse = await loadProjectRemote(selectedProject);
        return projectResponse;
      }
      catch (err) {
        dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
        dispatch({
          type: homeReducers.ADD_STATUS_MESSAGE,
          statusMessage: `There is not a project named: \n\n${selectedProject.description.project_name}\n\n on the server...`,
        });
        dispatch({type: homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE, bool: true});
        return err.ok;
      }
    }
    return Promise.resolve(projectResponse);
  };

  // Upload Dataset Properties
  const uploadDataset = async (dataset) => {
    try {
      console.log(dataset.name + ': Uploading Dataset Properties...');
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: '----------'});
      dispatch(
        {type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: dataset.name + ': Uploading Dataset Properties...'});

      let datasetCopy = JSON.parse(JSON.stringify(dataset));
      delete datasetCopy.spotIds;
      delete datasetCopy.current;
      delete datasetCopy.active;

      await serverRequests.updateDataset(datasetCopy, user.encoded_login);
      await serverRequests.addDatasetToProject(project.id, dataset.id, user.encoded_login);
      console.log(dataset.name + ': Finished Uploading Dataset Properties...');
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({
        type: homeReducers.ADD_STATUS_MESSAGE,
        statusMessage: dataset.name + ': Finished Uploading Dataset Properties.',
      });
    }
    catch (err) {
      console.error(dataset.name + ': Error Uploading Dataset Properties...');
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({
        type: homeReducers.ADD_STATUS_MESSAGE,
        statusMessage: dataset.name + ': Error Uploading Dataset Properties.',
      });
      throw Error;
    }

    await uploadSpots(dataset);
  };

  // Synchronously Upload Datasets
  const uploadDatasets = async () => {
    let currentRequest = 0;
    const activeDatasets = Object.values(datasets).filter(dataset => dataset.active === true);

    const makeNextDatasetRequest = async () => {
      await uploadDataset(activeDatasets[currentRequest]);
      currentRequest++;
      if (currentRequest < activeDatasets.length) await makeNextDatasetRequest();
      else {
        const msgText = 'Finished Uploading ' + activeDatasets.length + ' Dataset' + (activeDatasets.length === 1 ? '.' : 's.');
        console.log(msgText);
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: '----------'});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: msgText});
      }
    };

    if (activeDatasets.length === 0) {
      console.log('No Active Datasets Found.');
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'No Active Datasets Found.'});
    }
    else if (currentRequest < activeDatasets.length) {
      const msgText = 'Found ' + activeDatasets.length + ' Active Dataset' + (activeDatasets.length ? '' : 's') + ' to Upload.';
      console.log(msgText);
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: msgText});
      await makeNextDatasetRequest();
    }
  };

  // Upload Project Properties
  const uploadProject = async () => {
    try {
      console.log('Uploading Project Properties...');
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Uploading Project Properties...'});
      await serverRequests.updateProject(project, user.encoded_login);
      console.log('Finished Uploading Project Properties...');
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Finished Uploading Project Properties.'});
    }
    catch (err) {
      console.error('Error Uploading Project Properties.', err);
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Error Uploading Project Properties.'});
      throw Error;
    }
  };

  // Upload Spots
  const uploadSpots = async (dataset) => {
    let spots;
    if (dataset.spotIds) {
      spots = await useSpots.getSpotsByIds(dataset.spotIds);
      spots.forEach(spotValue => checkValidDateTime(spotValue));
    }
    if (isEmpty(spots)) {
      console.log(dataset.name + ': No Spots to Upload.');
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: dataset.name + ': No Spots to Upload.'});
    }
    else {
      try {
        const spotCollection = {
          type: 'FeatureCollection',
          features: Object.values(spots),
        };
        console.log(dataset.name + ': Uploading Spots...');
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: dataset.name + ': Uploading Spots...'});
        await serverRequests.updateDatasetSpots(dataset.id, spotCollection, user.encoded_login);
        console.log(dataset.name + ': Finished Uploading Spots.');
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: dataset.name + ': Finished Uploading Spots.'});
        await useImages.uploadImages(Object.values(spots), dataset.name);
      }
      catch (err) {
        console.error(dataset.name + ': Error Uploading Project Spots.', err);
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: dataset.name + ': Error Uploading Spots.'});
        throw Error;
      }
    }
  };

  const projectHelpers = {
    addDataset: addDataset,
    createProject: createProject,
    destroyDataset: destroyDataset,
    doesDeviceDirExist: doesDeviceDirExist,
    getAllDeviceProjects: getAllDeviceProjects,
    getAllServerProjects: getAllServerProjects,
    getCurrentDataset: getCurrentDataset,
    getDatasets: getDatasets,
    makeDatasetCurrent: makeDatasetCurrent,
    initializeNewProject: initializeNewProject,
    loadProjectFromDevice: loadProjectFromDevice,
    loadProjectRemote: loadProjectRemote,
    readDeviceFile: readDeviceFile,
    selectProject: selectProject,
    uploadDatasets: uploadDatasets,
    uploadProject: uploadProject,
  };

  return [projectHelpers];
};

export default useProject;
