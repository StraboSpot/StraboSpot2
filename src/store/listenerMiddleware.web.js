import {createListenerMiddleware, isAnyOf} from '@reduxjs/toolkit';
import * as turf from '@turf/turf';
import {Toast} from 'react-native-toast-notifications';

import {
  addedCustomFeatureTypes,
  addedDataset,
  addedTemplates,
  deletedDataset,
  setActiveTemplates,
  setUseContinuousTagging,
  setUseTemplate,
  updatedDatasetProperties,
  updatedProject,
} from '../modules/project/projects.slice';
import {
  deletedSpot,
  editedOrCreatedSpot,
  editedSpotImage,
  editedSpotImages,
  editedSpotProperties,
  editedSpots,
} from '../modules/spots/spots.slice';
import {
  deleteDataset,
  updateProject,
  uploadProjectDatasetDeleteSpot,
  uploadProjectDatasetsSpots,
} from '../services/serverAPI';
import {isEmpty} from '../shared/Helpers';

// Remove spotIds and images from dataset because those shouldn't go up to the server
const cleanDatasets = (datasets) => {
  return datasets.map((dataset) => {
    const {spotIds, images, ...rest} = dataset;
    return rest;
  });
};

// Delete dataset, update Project on server DB
const deleteDatasetListener = async (action, listenerApi) => {
  Toast.hideAll();
  let toastId = Toast.show('Saving changes...', {placement: 'bottom', duration: 100000});
  console.log('Action:', action, 'Delete Dataset:', action.payload);

  const newState = listenerApi.getState();
  console.log('New State:', newState);

  const encodedLogin = newState.user.encoded_login;
  const project = newState.project.project;
  const datasetId = action.payload;

  const resJSON = await deleteDataset(datasetId, encodedLogin);
  console.log('deleteDataset resJSON', resJSON);

  const resJSON2 = await updateProject(project, encodedLogin);
  console.log('updateProject resJSON', resJSON2);

  Toast.update(toastId, 'Changes saved.', {type: 'success', duration: 3000});
};

// Update project on server DB
const updateProjectListener = async (action, listenerApi) => {
  Toast.hideAll();
  let toastId = Toast.show('Saving changes...', {placement: 'bottom', duration: 100000});
  console.log('Action:', action, 'Updated Project:', action.payload);

  const newState = listenerApi.getState();
  console.log('New State:', newState);

  const encodedLogin = newState.user.encoded_login;
  const project = newState.project.project;

  const resJSON = await updateProject(project, encodedLogin);
  console.log('updateProject resJSON', resJSON);

  Toast.update(toastId, 'Changes saved.', {type: 'success', duration: 3000});
};

// Delete spot, update datasets and project on server DB
const uploadProjectDatasetDeleteSpotListener = async (action, listenerApi) => {
  Toast.hideAll();
  let toastId = Toast.show('Saving changes...', {placement: 'bottom', duration: 100000});
  console.log('Action:', action, 'Deleted Spot Id:', action.payload);

  listenerApi.cancelActiveListeners();      // Can cancel other running instances

  const newState = listenerApi.getState();
  console.log('New State:', newState);

  const encodedLogin = newState.user.encoded_login;
  const project = newState.project.project;
  const datasets = newState.project.datasets;
  const spotId = action.payload;

  // Create object to send to server
  let objectToSend = {};
  if (!isEmpty(spotId)) objectToSend.spotId = spotId;
  if (!isEmpty(project)) objectToSend.project = newState.project.project;
  if (!isEmpty(datasets)) objectToSend.datasets = cleanDatasets(Object.values(datasets));
  const jsonToSend = JSON.parse(JSON.stringify(objectToSend));

  const resJSON = await uploadProjectDatasetDeleteSpot(jsonToSend, encodedLogin);
  console.log('uploadProjectDatasetDeleteSpot resJSON', resJSON);

  Toast.update(toastId, 'Changes saved.', {type: 'success', duration: 3000});
};

// Update spots, datasets and project on server DB
const updatedProjectDatasetsSpotsListener = async (action, listenerApi) => {
  Toast.hideAll();
  let toastId = Toast.show('Saving changes...', {placement: 'bottom', duration: 100000});
  console.log('Action:', action, 'Spot edited:', action.payload);

  listenerApi.cancelActiveListeners();      // Can cancel other running instances

  const newState = listenerApi.getState();
  console.log('New State:', newState);

  const encodedLogin = newState.user.encoded_login;
  const project = newState.project.project;
  const datasets = Object.values(newState.project.datasets);

  let objectToSend = {};

  // Spots Updated
  if (action.type.includes('spot/editedSpots')) {
    const spotIds = action.payload.map(s => s.properties.id);
    const spotIdsGroupedByDatasetId = spotIds.reduce((acc, spotId) => {
      const dataset = datasets.find(d => d.spotIds?.find(id => id === spotId));
      const datasetId = dataset.id;
      if (Object.keys(acc).includes(datasetId.toString())) return {...acc, [datasetId]: [...acc[datasetId], spotId]};
      else return {...acc, [datasetId]: [spotId]};
    }, {});
    const datasetsToSend = Object.entries(spotIdsGroupedByDatasetId).reduce((acc, [datasetId, spotIdsInDataset]) => {
      const spots = spotIdsInDataset.map(spotIdInDataset => newState.spot.spots[spotIdInDataset]);
      return [...acc, {...newState.project.datasets[datasetId], spots: turf.featureCollection(spots)}];
    }, []);
    // Create object to send to server
    objectToSend = {project: {...project, datasets: cleanDatasets(datasetsToSend)}};
  }
  // Spot Updated
  else if (action.type.includes('spot/')) {
    // Get Spot
    const spotId = action.payload?.properties?.id || newState.spot.selectedSpot.properties.id;
    const spot = newState.spot.spots[spotId];

    // Get dataset for spot
    let dataset = datasets.find(d => d.spotIds?.find(id => id === spotId));
    dataset = {...dataset, spots: turf.featureCollection([spot])};

    // Create object to send to server
    objectToSend = {project: {...project, datasets: cleanDatasets([dataset])}};
  }
  // Dataset(s) Updated
  else {
    // Create object to send to server
    objectToSend = {project: {...project, datasets: cleanDatasets(datasets)}};
  }
  const jsonToSend = JSON.parse(JSON.stringify(objectToSend));

  // Send object to server
  console.log('Sending updates to server', jsonToSend);
  const resJSON = await uploadProjectDatasetsSpots(jsonToSend, encodedLogin);
  console.log('uploadProjectDatasetsSpots resJSON', resJSON);

  Toast.update(toastId, 'Changes saved.', {type: 'success', duration: 3000});
};

const listenerMiddleware = createListenerMiddleware();

// Spot, Dataset and Project Updates to Send to Server
listenerMiddleware.startListening({actionCreator: deletedDataset, effect: deleteDatasetListener});
listenerMiddleware.startListening({actionCreator: deletedSpot, effect: uploadProjectDatasetDeleteSpotListener});
listenerMiddleware.startListening({
  matcher: isAnyOf(editedSpots, editedSpotImage, editedSpotImages, editedOrCreatedSpot, editedSpotProperties,
    addedDataset, updatedDatasetProperties), effect: updatedProjectDatasetsSpotsListener,
});

// Don't need to do addedSpotsFromDevice until can add from device on web
// listenerMiddleware.startListening({actionCreator: addedSpotsFromDevice, effect: updatedProjectDatasetSpotListener});

// Don't need to do addedSpotsIdsToDataset until moving a dataset on metadata page works
// listenerMiddleware.startListening({actionCreator: addedSpotsIdsToDataset, effect: addedCustomFeatureTypesListener});

// Project Only Updates to Send to Server
listenerMiddleware.startListening({
  matcher: isAnyOf(addedCustomFeatureTypes, addedTemplates, setActiveTemplates, setUseContinuousTagging,
    setUseTemplate, updatedProject),
  effect: updateProjectListener,
});

export default listenerMiddleware;
