import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty} from '../shared/Helpers';

// Constants
import {projectReducers} from '../project/Project.constants';
import {spotReducers} from './Spot.constants';

// Hooks
import useImagesHook from '../components/images/useImages';
import useServerRequestsHook from '../services/useServerRequests';

const useSpots = (props) => {
  const dispatch = useDispatch();
  const spots = useSelector(state => state.spot.spots);
  const datasets = useSelector(state => state.project.datasets);

  const [useImages] = useImagesHook();
  const [useServerRequests] = useServerRequestsHook();

  // Create a new Spot
  const createSpot = async (feature) => {
    let newSpot = feature;
    newSpot.properties.id = getNewId();
    let d = new Date(Date.now());
    d.setMilliseconds(0);
    newSpot.properties.date = newSpot.properties.time = d.toISOString();
    // Sets modified and viewed timestamps in milliseconds
    newSpot.properties.modified_timestamp = Date.now();
    newSpot.properties.viewed_timestamp = Date.now();
    newSpot.properties.name = 'Spot ' + Object.keys(spots).length;
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

  const downloadSpots = async (dataset, encodedLogin) => {
    const datasetInfoFromServer = await useServerRequests.getDatasetSpots(dataset.id, encodedLogin);
    if (!isEmpty(datasetInfoFromServer) && datasetInfoFromServer.features) {
      const spotsOnServer = datasetInfoFromServer.features;
      if (!isEmpty(datasetInfoFromServer) && spotsOnServer) {
        console.log(spotsOnServer);
        dispatch({type: spotReducers.ADD_SPOTS, spots: spotsOnServer});
        const spotIds = Object.values(spotsOnServer).map(spot => spot.properties.id);
        dispatch({type: projectReducers.DATASETS.ADD_SPOTS_IDS_TO_DATASET, datasetId: dataset.id, spotIds: spotIds});
        const neededImagesIds = await useImages.gatherNeededImages(spotsOnServer);
        // console.table(neededImagesIds);
        await useImages.downloadImages(neededImagesIds);
      }
    }
  };

  const getMappableSpots = () => {
    const allSpotsCopy = JSON.parse(JSON.stringify(Object.values(spots)));
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
    downloadSpots: downloadSpots,
    getMappableSpots: getMappableSpots,
    getSpotById: getSpotById,
    getSpotsByIds: getSpotsByIds,
  }];
};

export default useSpots;
