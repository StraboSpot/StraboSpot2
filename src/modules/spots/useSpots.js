import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {randomNames} from '../../assets/test-data/default-names';
import {getNewId, isEmpty} from '../../shared/Helpers';

// Constants
import {projectReducers} from '../project/project.constants';
import {spotReducers} from './spot.constants';

// Hooks
import useImagesHook from '../images/useImages';
import useProjectHook from '../project/useProject';
import useServerRequestsHook from '../../services/useServerRequests';
import {homeReducers} from '../home/home.constants';

const useSpots = (props) => {
  const dispatch = useDispatch();
  const spots = useSelector(state => state.spot.spots);
  const datasets = useSelector(state => state.project.datasets);

  const [useImages] = useImagesHook();
  const [useServerRequests] = useServerRequestsHook();

  // Create a new Spot
  const createSpot = async (feature) => {
    let randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    let newSpot = feature;
    newSpot.properties.id = getNewId();
    let d = new Date(Date.now());
    d.setMilliseconds(0);
    newSpot.properties.date = newSpot.properties.time = d.toISOString();
    // Sets modified and viewed timestamps in milliseconds
    newSpot.properties.modified_timestamp = Date.now();
    newSpot.properties.viewed_timestamp = Date.now();
    newSpot.properties.name = randomName;
    console.log('Creating new Spot:', newSpot);
    await dispatch({type: spotReducers.ADD_SPOT, spot: newSpot});
    const currentDataset = Object.values(datasets).find(dataset => dataset.current);
    console.log('Active Dataset', currentDataset);
    await dispatch({
      type: projectReducers.DATASETS.ADD_SPOTS_IDS_TO_DATASET,
      datasetId: currentDataset.id,
      spotIds: [newSpot.properties.id],
    });

    console.log('Finished creating new Spot. All Spots: ', spots);

    return newSpot;
  };

  const deleteSpot = async id => {
    console.log(id);
    Object.values(datasets).map(dataset => {
      if (dataset.spotIds) {
        console.log(dataset.spotIds);
        const exists = dataset.spotIds.includes(id);
        if (exists) {
          console.log(dataset.id);
          console.log(dataset.spotIds.filter(spotId => id !== spotId));
          const filteredLSpotIdList = dataset.spotIds.filter(spotId => id !== spotId);
          dispatch({type: projectReducers.DATASETS.DELETE_SPOT_ID, filteredList: filteredLSpotIdList, datasetId: dataset.id});
          dispatch({type: spotReducers.DELETE_SPOT, id: id});
        }
      }
    });
    return Promise.resolve('spot deleted');
  };

  const deleteSpotsFromDataset = (dataset, spotId) => {
    const updatedSpotIds = dataset.spotIds.filter(id => id !== spotId);
    dispatch({type: projectReducers.DATASETS.DELETE_SPOT_ID, filteredList: updatedSpotIds, datasetId: dataset.id});
    dispatch({type: spotReducers.DELETE_SPOT, id: spotId});
    console.log(dataset, 'Spots', spots);
    return Promise.resolve(dataset.spotIds);
  };

  const downloadSpots = async (dataset, encodedLogin) => {
    // dispatch({type: 'CLEAR_STATUS_MESSAGES'});
    dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Downloading Spots...'});
    const datasetInfoFromServer = await useServerRequests.getDatasetSpots(dataset.id, encodedLogin);
    if (!isEmpty(datasetInfoFromServer) && datasetInfoFromServer.features) {
      const spotsOnServer = datasetInfoFromServer.features;
      if (!isEmpty(datasetInfoFromServer) && spotsOnServer) {
        console.log(spotsOnServer);
        dispatch({type: spotReducers.ADD_SPOTS, spots: spotsOnServer});
        const spotIds = Object.values(spotsOnServer).map(spot => spot.properties.id);
        dispatch({type: projectReducers.DATASETS.ADD_SPOTS_IDS_TO_DATASET, datasetId: dataset.id, spotIds: spotIds});
        dispatch({type: 'REMOVE_LAST_STATUS_MESSAGE'});
        dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Downloaded Spots'});
        const neededImagesIds = await useImages.gatherNeededImages(spotsOnServer);
        if (neededImagesIds.length === 0) {
          dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
          dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'No New Images to Download'});
          // dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Download Complete!'});
        }
        else return await useImages.downloadImages(neededImagesIds);
      }
      return Promise.resolve({message: 'done - Spots'});
    }
    else return Promise.reject('No Spots!');
  };

  // Get only the Spots in the active Datasets
  const getActiveSpotsObj = () => {
    const activeSpotIds = Object.values(datasets).flatMap(dataset => dataset.active ? dataset.spotIds || [] : []);
    let activeSpots = {};
    activeSpotIds.map(spotId => {
     if (spots[spotId]) activeSpots = {...activeSpots, [spotId]: spots[spotId]};
     else console.log('Missing Spot', spotId);
    });
    return activeSpots;
  };

  const getMappableSpots = () => {
    const allSpotsCopy = JSON.parse(JSON.stringify(Object.values(getActiveSpotsObj())));
    return allSpotsCopy.filter(spot => spot.geometry && !spot.properties.strat_section_id);
  };

  const getSpotById = (spotId) => {
    return spots[spotId];
  };

  const getSpotsByIds = (spotIds) => {
    const foundSpots = [];
    Object.entries(spots).forEach(obj => {
      if (spotIds.includes(obj[1].properties.id)) foundSpots.push(obj[1]);
    });
    return foundSpots;
  };

  return [{
    createSpot: createSpot,
    deleteSpot: deleteSpot,
    deleteSpotsFromDataset: deleteSpotsFromDataset,
    downloadSpots: downloadSpots,
    getActiveSpotsObj: getActiveSpotsObj,
    getMappableSpots: getMappableSpots,
    getSpotById: getSpotById,
    getSpotsByIds: getSpotsByIds,
  }];
};

export default useSpots;
