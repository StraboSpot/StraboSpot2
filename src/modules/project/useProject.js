import {useDispatch, useSelector} from 'react-redux';
import {homeReducers} from '../home/home.constants';
import {getNewId, isEmpty} from '../../shared/Helpers';

// Hooks
import useServerRequests from '../../services/useServerRequests';
import useImagesHook from '../images/useImages';
import useSpotsHook from '../spots/useSpots';
import {spotReducers} from '../spots/spot.constants';
import {projectReducers} from './project.constants';

const useProject = () => {
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
              dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: `Dataset Deleted!`});
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
    // }
    return Promise.resolve();
  };

  const getAllProjects = async () => {
    try {
      const response = await serverRequests.getMyProjects(user.encoded_login);
      return response;
    }
    catch (err) {
     return err.ok;
    }
  };

  const getCurrentDataset = () => {
    return Object.values(datasets).find(dataset => dataset.current);
  };

  const loadProjectRemote = async (selectedProject) => {
    console.log(`Getting ${selectedProject.name} project from server...`);
    if (!isEmpty(project)) {
      await destroyOldProject();
    }
    try {
      const projectResponse = await serverRequests.getProject(selectedProject.id, user.encoded_login);
      console.log('Loaded Project:', projectResponse);
      if (!projectResponse.description) projectResponse.description = {};
      if (!projectResponse.description.project_name) projectResponse.description.project_name = 'Unnamed';
      if (!projectResponse.other_features) projectResponse.other_features = defaultTypes;
      await dispatch({type: projectReducers.PROJECTS, project: projectResponse});
      await getDatasets(selectedProject);
      return Promise.resolve(projectResponse);
    }
    catch (err) {
      return err.ok;
    }
  };

  const getDatasets = async (project) => {
    const projectDatasetsFromServer = await serverRequests.getDatasets(project.id, user.encoded_login);
    if (projectDatasetsFromServer === 401) {
      console.log('Uh Oh...');
      return Promise.reject()
    }
    else {
      console.log('Saved datasets:', projectDatasetsFromServer);
      if (projectDatasetsFromServer.datasets.length === 1) {
        projectDatasetsFromServer.datasets[0].active = true;
        projectDatasetsFromServer.datasets[0].current = true;
      }
      else {
        projectDatasetsFromServer.datasets.map(dataset => {
          dataset.active = false;
        });
      }
      const datasets = Object.assign({}, ...projectDatasetsFromServer.datasets.map(item => ({[item.id]: item})));
      dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasets});
      if (projectDatasetsFromServer.datasets.length === 1){
        await useSpots.downloadSpots(projectDatasetsFromServer.datasets[0], user.encoded_login);
      }
      // await useSpots.downloadSpots(projectDatasetsFromServer.datasets[0], user.encoded_login);
      return Promise.resolve(datasets);
    }
  };

  const makeDatasetCurrent = (id) => {
    Object.values(datasets).map(data => data.current = false);
    const datasetsCopy = JSON.parse(JSON.stringify(datasets));
    datasetsCopy[id].current = !datasetsCopy[id].current;
    dispatch({type: projectReducers.DATASETS.DATASETS_UPDATE, datasets: datasetsCopy});
    return Promise.resolve();
  };

  const selectProject = async (selectedProject) => {
    console.log('Getting project...');
    try {
      const projectResponse = await serverRequests.getProject(selectedProject.id, user.encoded_login);
      console.log('Loaded project \n', projectResponse);
      if (!isEmpty(project)) {
        await destroyOldProject();
      }
      dispatch({type: projectReducers.PROJECTS, project: projectResponse});
      await getDatasets(selectedProject);
      return projectResponse;
    }
    catch (err) {
      console.log(err)
      dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE,
        statusMessage: `There is not a project named: \n\n${selectedProject.description.project_name}\n\n on the server...`});
      dispatch({type: homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE, bool: true});
      return err.ok;
    }
  };

  const uploadDataset = async (dataset) => {
    let datasetCopy = JSON.parse(JSON.stringify(dataset));
    delete datasetCopy.spotIds;
    delete datasetCopy.current;
    delete datasetCopy.active;
    return serverRequests.updateDataset(datasetCopy, user.encoded_login).then((response) => {
      console.log('Finished updating dataset', response);
      return serverRequests.addDatasetToProject(project.id, dataset.id, user.encoded_login).then((response2) => {
        console.log('Finished adding dataset to project', response2);
        return uploadSpots(dataset).then(() => {
          return Promise.resolve();
        });
      });
    });
  };

  const uploadDatasets = async () => {
    let currentRequest = 0;
    const activeDatasets = Object.values(datasets).filter(dataset => dataset.active === true);
    dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
    dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Uploading Datasets...'});

    const makeNextRequest = async () => {
      console.log('Making request...');
      return uploadDataset(activeDatasets[currentRequest]).then(() => {
        currentRequest++;
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        if (currentRequest > 0 && currentRequest < activeDatasets.length) {
          dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Uploading Dataset: ' + currentRequest + '/' + activeDatasets.length});
        }
        if (currentRequest < activeDatasets.length) {
          return makeNextRequest();
        }
        else {
          dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
          dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: activeDatasets.length + ' Datasets uploaded!'});
          return Promise.resolve();
        }
      }, (err) => {
        console.log('Error uploading dataset.', err);
        dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Error uploading dataset.'});
        dispatch({type: homeReducers.SET_LOADING, value: false});
        return Promise.reject();
      });
    };

    if (currentRequest < activeDatasets.length) {
      console.log('MakeNextRequest', currentRequest);
      return makeNextRequest();
    }
    if (activeDatasets.length === 0) {
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'There are no active datasets.'});
      return Promise.reject('No Active Datasets');
    }
    else return Promise.resolve();
  };

  const uploadImages = async spots => {
    return await useImages.uploadImages(spots);
  };

  const uploadProject = async () => {
    dispatch({type: homeReducers.SET_LOADING, value: true});
    dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
    dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, value: true});
    console.log('PROJECT UPLOADING...');
    dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Uploading Project...'});
    try {
      const updatedProject = await serverRequests.updateProject(project, user.encoded_login);
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Finished uploading project.'});
      console.log('Going to uploadDatasets next');
      return Promise.resolve(updatedProject);
    }
    catch (err) {
      dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Error uploading project.'});
      console.log('Error uploading project', err);
      return Promise.reject(err);
    }
  };

  const uploadSpots = async (dataset) => {
    let spots;
    if (dataset.spotIds){
      spots = await useSpots.getSpotsByIds(dataset.spotIds);
      spots.forEach(spotValue => checkValidDateTime(spotValue));
    }
    if (isEmpty(spots)) {
      console.log('No Spots to Upload');
      dispatch({
        type: homeReducers.ADD_STATUS_MESSAGE,
        statusMessage: `${dataset} has 0 spots to Upload `});
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
    }
    else {
      const spotCollection = {
        type: 'FeatureCollection',
        features: Object.values(spots),
      };
      return serverRequests.updateDatasetSpots(dataset.id, spotCollection, user.encoded_login).then(() => {
        return uploadImages(spots);
      });
    }
    return Promise.resolve();
  };

  const projectHelpers = {
    addDataset: addDataset,
    createProject: createProject,
    destroyDataset: destroyDataset,
    getAllProjects: getAllProjects,
    getCurrentDataset: getCurrentDataset,
    getDatasets: getDatasets,
    makeDatasetCurrent: makeDatasetCurrent,
    initializeNewProject: initializeNewProject,
    loadProjectRemote: loadProjectRemote,
    selectProject: selectProject,
    uploadDatasets: uploadDatasets,
    uploadProject: uploadProject,
  };

  return [projectHelpers];
};

export default useProject;
