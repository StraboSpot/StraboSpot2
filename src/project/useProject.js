import {useDispatch, useSelector} from 'react-redux';
import {homeReducers} from '../views/home/Home.constants';
import {isEmpty} from '../shared/Helpers';

// Hooks
import useServerRequests from '../services/useServerRequests';
import useImagesHook from '../components/images/useImages';
import useSpotsHook from '../spots/useSpots';

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

  const getCurrentDataset = () => {
    return Object.values(datasets).find(dataset => dataset.current);
  };

  const loadProjectRemote = async (projectId, encodedLogin) => {
    console.log(`Getting ${projectId.name} project from server...`);
    const project = await serverRequests.getProject(projectId, encodedLogin);
    console.log('Loaded Project:', project);
    if (!project.description) project.description = {};
    if (!project.description.project_name) project.description.project_name = 'Unnamed';
    if (!project.other_features) project.other_features = defaultTypes;
    return project;
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
          dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: activeDatasets.length + ' Datasets uploaded'});
          return Promise.resolve();
        }
      }, (err) => {
        console.log('Error uploading dataset.', err);
        dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Error uploading dataset.'});
        return Promise.reject();
      });
    };

    if (currentRequest < activeDatasets.length) {
      console.log('MakeNextRequest', currentRequest);
      return makeNextRequest();
    }
    else return Promise.resolve();
  };

  const uploadImages = async spots => {
    dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Checking Server for images...'});
    return await useImages.uploadImages(spots);
  };

  const uploadProject = async () => {
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
    }
    spots.forEach(spotValue => checkValidDateTime(spotValue));
    if (isEmpty(spots)) {
      console.log('No Spots to Upload');
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'No Spots to Upload'});
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
    getCurrentDataset: getCurrentDataset,
    loadProjectRemote: loadProjectRemote,
    uploadDatasets: uploadDatasets,
    uploadProject: uploadProject,
  };

  return [projectHelpers];
};

export default useProject;
