import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import * as ProjectActions from './project.constants';
import {DEFAULT_GEOLOGIC_TYPES, DEFAULT_RELATIONSHIP_TYPES} from './project.constants';
import {
  addedDataset,
  addedProjectDescription,
  clearedDatasets,
  deletedDataset,
  deletedSpotIdFromDatasets,
  setActiveDatasets,
  setSelectedDataset,
  setSelectedProject,
} from './projects.slice';
import {APP_DIRECTORIES} from '../../services/directories.constants';
import useDeviceHook from '../../services/useDevice';
import useDownloadHook from '../../services/useDownload';
import useImportHook from '../../services/useImport';
import useServerRequestsHook from '../../services/useServerRequests';
import {getNewId, isEmpty} from '../../shared/Helpers';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setBackupModalVisible,
  setErrorMessagesModalVisible,
  setLoadingStatus,
  setProgressModalVisible,
  setStatusMessagesModalVisible,
} from '../home/home.slice';
import {clearedMaps} from '../maps/maps.slice';
import {clearedSpots, deletedSpot} from '../spots/spots.slice';

const useProject = () => {
  const dispatch = useDispatch();
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const datasets = useSelector(state => state.project.datasets) || {};
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);
  const selectedProject = useSelector(state => state.project.selectedProject) || {};
  const user = useSelector(state => state.user);

  const useServerRequests = useServerRequestsHook();
  const toast = useToast();
  const useDownload = useDownloadHook();
  const useDevice = useDeviceHook();
  const useImport = useImportHook();

  const addDataset = async (name) => {
    const datasetObj = createDataset(name);
    dispatch(addedDataset(datasetObj));
    console.log('Added datasets', datasets);
    return Promise.resolve();
  };

  const checkUserAuthorization = async (password) => {
    return await useServerRequests.authenticateUser(user.email, password.trim());
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

  const createDataset = (name) => {
    const newDate = new Date().toISOString();
    const modifiedTimeStamp = Date.now();
    const id = getNewId();
    return {
      id: id,
      name: name ? name : 'Default',
      date: newDate,
      modified_timestamp: modifiedTimeStamp,
      spotIds: [],
      images: {
        neededImagesIds: [],
        imageIds: [],
      },
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
      templates: {},
      useContinuousTagging: false,
    };
    dispatch(addedProjectDescription(currentProject));
    const defaultDataset = createDataset();
    dispatch(addedDataset(defaultDataset));
  };

  const deleteProject = async (project) => {
    await useServerRequests.deleteProject(project);
  };

  const destroyDataset = async (id) => {
    try {
      dispatch(setStatusMessagesModalVisible(true));
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Deleting Dataset...'));
      if (datasets && datasets[id] && datasets[id].spotIds) {
        let spotsDeletedCount = 0;
        console.log(datasets[id].spotIds.length, 'Spot(s) in Dataset to Delete.');
        await Promise.all(datasets[id].spotIds.map((spotId) => {
            dispatch(deletedSpotIdFromDatasets(spotId));
            dispatch(deletedSpot(spotId));
            spotsDeletedCount++;
            console.log('Deleted', spotsDeletedCount, 'Spot(s)');
            console.log('Spot Ids in Dataset:', datasets[id].spotIds);
          }),
        );
      }
      dispatch(deletedDataset(id));
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished Deleting Dataset.'));
    }
    catch (err) {
      console.log('Error Deleting Dataset.');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Deleting Dataset.'));
    }
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
  };

  const destroyOldProject = () => {
    dispatch(clearedSpots());
    dispatch(clearedDatasets());
    dispatch(clearedMaps());
    console.log('Destroy complete');
  };

  const doesDeviceBackupDirExist = async (subDirectory) => {
    if (subDirectory !== undefined) return useDevice.doesDeviceDirExist(APP_DIRECTORIES.BACKUP_DIR + subDirectory);
    else return useDevice.doesDeviceDirExist(APP_DIRECTORIES.BACKUP_DIR);
  };

  const getActiveDatasets = () => {
    const activeDatasets = activeDatasetsIds.map(datasetId => datasets[datasetId]);
    return activeDatasets.filter(activeDataset => !isEmpty(activeDataset));
  };

  const getAllDeviceProjects = async (directory) => {
    // const deviceProject = await useDevice.doesDeviceDirExist(APP_DIRECTORIES.BACKUP_DIR).then((res) => {
    //   console.log(`${APP_DIRECTORIES.BACKUP_DIR} exists: ${res}`);
    //   if (res) {
    //     return useDevice.readDirectory(APP_DIRECTORIES.BACKUP_DIR).then((files) => {
    //       console.log('Files on device', files);
    //       let id = 0;
    //       if (!isEmpty(files)) {
    //         const deviceFiles = files.map((file) => {
    //           return {id: id++, fileName: file};
    //         });
    //         return Promise.resolve({projects: deviceFiles});
    //       }
    //       else return Promise.resolve([]);
    //     });
    //   }
    //   else return res;
    // });
    // return Promise.resolve(deviceProject);
    let id = 0;
    const exists = await useDevice.doesDeviceBackupDirExist(undefined);
    if (exists) {
      const res = await useDevice.readDirectory(directory);
      const deviceFiles = res.map((file) => {
        return {id: id++, fileName: file};
      });
      return {projects: deviceFiles};
    }
    else console.log('Does not exist');
  };

  const getAllExternalStorageProjects = () => {

  };

  const getAllServerProjects = async () => {
    try {
      return await useServerRequests.getMyProjects(user.encoded_login);
    }
    catch (err) {
      return err.ok;
    }
  };

  const getDatasetFromSpotId = (spotId) => {
    let datasetIdFound;
    for (const dataset of Object.values(datasets)) {
      const spotIdFound = dataset.spotIds.find(id => id === spotId);
      if (spotIdFound) {
        datasetIdFound = dataset.id;
        break;
      }
    }
    console.log('HERE IS THE DATASET', datasetIdFound);
    if (!datasetIdFound) console.error('Dataset not found');
    return datasetIdFound;
  };

  const getSelectedDatasetFromId = () => {
    return selectedDatasetId ? datasets[selectedDatasetId] : 'Unknown';
  };

  const initializeNewProject = async (descriptionData) => {
    destroyOldProject();
    await createProject(descriptionData);
    return Promise.resolve();
  };

  const loadProjectWeb = async (projectId) => {
    try {
      await useDownload.initializeDownload({id: projectId});
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
    catch (err) {
      console.error('Error loading project', err);
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Error loading project!'));
      dispatch(setErrorMessagesModalVisible(true));
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      throw Error;
    }
  };

  const makeDatasetCurrent = (datasetId) => {
    const datasetName = datasets[datasetId].name;
    toast.show(`Selected Dataset has been switched to ${datasetName}!`, {type: 'warning', animationType: 'slide-in'});
    toast.hideAll();
    dispatch(setSelectedDataset(datasetId));
  };

  const setSwitchValue = async (val, dataset) => { //TODO look at setSwitchValue to see if condition is needed.
    try {
      if (!isEmpty(user.name) && val) {
        dispatch(setActiveDatasets({bool: val, dataset: dataset.id}));
        return 'SWITCHED';
      }
      else dispatch(setActiveDatasets({bool: val, dataset: dataset.id}));
    }
    catch (err) {
      console.log('Error setting switch value.');
    }
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
  };

  const switchProject = async (action) => {
    console.log('User wants to:', action);
    if (action === ProjectActions.BACKUP_TO_SERVER) dispatch(setProgressModalVisible(true));
    else if (action === ProjectActions.BACKUP_TO_DEVICE) dispatch(setBackupModalVisible(true));
    else if (action === ProjectActions.OVERWRITE) {
      if (selectedProject.source === 'device') {
        dispatch(clearedStatusMessages());
        dispatch(setStatusMessagesModalVisible(true));
        const res = await useImport.loadProjectFromDevice(selectedProject.project.fileName);
        dispatch(setStatusMessagesModalVisible(false));
        console.log('Done loading project', res);
      }
      else if (selectedProject.source === 'server') {
        dispatch(setSelectedProject({project: '', source: ''}));
        await useDownload.initializeDownload(selectedProject.project);
      }
    }
  };

  return {
    addDataset: addDataset,
    checkUserAuthorization: checkUserAuthorization,
    checkValidDateTime: checkValidDateTime,
    createDataset: createDataset,
    createProject: createProject,
    deleteProject: deleteProject,
    destroyDataset: destroyDataset,
    destroyOldProject: destroyOldProject,
    doesDeviceBackupDirExist: doesDeviceBackupDirExist,
    getActiveDatasets: getActiveDatasets,
    getAllDeviceProjects: getAllDeviceProjects,
    getAllExternalStorageProjects: getAllExternalStorageProjects,
    getAllServerProjects: getAllServerProjects,
    getDatasetFromSpotId: getDatasetFromSpotId,
    getSelectedDatasetFromId: getSelectedDatasetFromId,
    initializeNewProject: initializeNewProject,
    loadProjectWeb: loadProjectWeb,
    makeDatasetCurrent: makeDatasetCurrent,
    setSwitchValue: setSwitchValue,
    switchProject: switchProject,
  };
};

export default useProject;
