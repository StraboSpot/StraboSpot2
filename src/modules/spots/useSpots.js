import {useDispatch, useSelector} from 'react-redux';

// Constants
import {projectReducers} from '../project/project.constants';
import {spotReducers} from './spot.constants';

// Hooks
import useImagesHook from '../images/useImages';
import useServerRequestsHook from '../../services/useServerRequests';
import {homeReducers} from '../home/home.constants';

// Utilities
import {getNewId, isEmpty} from '../../shared/Helpers';
import {randomNames} from '../../assets/test-data/default-names';

const useSpots = (props) => {
  const dispatch = useDispatch();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spot.spots);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const datasets = useSelector(state => state.project.datasets);

  const [useImages] = useImagesHook();
  const [useServerRequests] = useServerRequestsHook();

  // Copy Spot to a new Spot omiting specific properties
  const copySpot = async () => {
    // Ids are generated in such quick succession here that using the getNewId function from Helpers.js doesn't
    // work since that is based on a timestamp
    const getNewCopyId = () => Math.floor(10000000000000 + Math.random() * 90000000000000);

    let copiedSpot = {'type': 'Feature'};
    let {name, id, date, time, modified_timestamp, images, samples, viewed_timestamp, ...properties} = selectedSpot.properties;
    copiedSpot.properties = properties;
    if (properties.orientation_data) {
      const orientation_data = properties.orientation_data.map(measurement => {
        let {id: measurementId, strike, dip_direction, dip, trend, plunge, rake, rake_calculated, ...measurementRest} = measurement;
        if (measurementRest.associated_orientation) {
          const associated_orientation = measurementRest.associated_orientation.map(assocMeasurement => {
            let {id: measurementIdA, strike: strikeA, dip_direction: dipDirectionA, dip: dipA, trend: trendA, plunge: plungeA, rake: rakeA, rake_calculated: rakeCalculatedA, ...assocMeasurementRest} = assocMeasurement;
            return {...assocMeasurementRest, id: getNewCopyId()};
          });
          if (associated_orientation) {
            return {...measurementRest, id: getNewCopyId(), associated_orientation: associated_orientation};
          }
        }
        else return {...measurementRest, id: getNewCopyId()};
      });
      if (orientation_data) copiedSpot.properties.orientation_data = orientation_data;
    }
    const newSpot = await createSpot(copiedSpot);
    dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: newSpot});
    console.log('Spot Copied. New Spot', newSpot);
  };

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
    if (currentImageBasemap && newSpot.geometry && newSpot.geometry.type === 'Point') { //newSpot geometry is unavailable when spot is copied.
      const rootSpot = findRootSpot(currentImageBasemap.id);
      if (rootSpot) {
        newSpot.properties.lng = rootSpot.geometry.coordinates[0];
        newSpot.properties.lat = rootSpot.geometry.coordinates[1];
      }
    }
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

  // find the rootSpot for a given image id.
  const findRootSpot = (imageId) => {
    let rootSpot, imageFound = false;
    const allSpots = getActiveSpotsObj();
    for (let index in allSpots) {
      let currentSpot = allSpots[index];
      let spotImages = currentSpot.properties.images;
      for (let imageIndex in spotImages) {
        let currentImage = spotImages[imageIndex];
        if (currentImage.id === imageId) {
          imageFound = true;
        }
      }
      if (imageFound) {
        rootSpot = currentSpot;
        break;
      }
    }
    if (rootSpot && rootSpot.properties.image_basemap) {
      return findRootSpot(rootSpot.properties.image_basemap);
    }
    return rootSpot;
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
          dispatch(
            {type: projectReducers.DATASETS.DELETE_SPOT_ID, filteredList: filteredLSpotIdList, datasetId: dataset.id});
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
          dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Download Complete!'});
        }
        else return await useImages.downloadImages(neededImagesIds);
      }
      return Promise.resolve({message: 'done - Spots'});
    }
    else return Promise.reject('No Spots!');
  };

  const getAllImageBaseMaps = () => {
    const activeSpotObjs = getActiveSpotsObj();
    const allImageBaseMaps = new Set();
    const allImagesSet = new Set();
    var currentSpot, currentImage;
    for (var key in activeSpotObjs) {
      currentSpot = activeSpotObjs[key];
      if (!isEmpty(currentSpot.properties.images)) {
        for (var imageKey in Object.keys(currentSpot.properties.images)) {
          currentImage = currentSpot.properties.images[imageKey];
          allImagesSet.add(currentImage);
          if (currentImage != null && currentImage.annotated && currentImage.annotated != undefined) {
            allImageBaseMaps.add(currentImage);
          }
        }
      }
    }
    return allImageBaseMaps;
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
    if (currentImageBasemap) {
      return allSpotsCopy.filter(
        spot => spot.geometry && !spot.properties.strat_section_id && spot.properties.image_basemap === currentImageBasemap.id);
    }
    return allSpotsCopy.filter(
      spot => spot.geometry && !spot.properties.strat_section_id && !spot.properties.image_basemap);
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
    copySpot: copySpot,
    createSpot: createSpot,
    deleteSpot: deleteSpot,
    deleteSpotsFromDataset: deleteSpotsFromDataset,
    downloadSpots: downloadSpots,
    getActiveSpotsObj: getActiveSpotsObj,
    getMappableSpots: getMappableSpots,
    getSpotById: getSpotById,
    getSpotsByIds: getSpotsByIds,
    getAllImageBaseMaps: getAllImageBaseMaps,
    findRootSpot: findRootSpot,
  }];
};

export default useSpots;
