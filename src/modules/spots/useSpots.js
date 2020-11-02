import {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import useServerRequestsHook from '../../services/useServerRequests';
import {getNewId, isEmpty} from '../../shared/Helpers';
import {
  addedStatusMessage,
  removedLastStatusMessage,
  setLoadingStatus,
  setProjectLoadComplete,
} from '../home/home.slice';
import useImagesHook from '../images/useImages';
import {addedSpotsIdsToDataset, deletedSpotIdFromDataset, updatedProject} from '../project/projects.slice';
import {GENERAL_KEYS_ICONS, SED_KEYS_ICONS} from './spot.constants';
import {addedSpot, addedSpots, deletedSpot, setSelectedSpot} from './spots.slice';

const useSpots = (props) => {
  const dispatch = useDispatch();

  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const datasets = useSelector(state => state.project.datasets);
  const preferences = useSelector(state => state.project.project.preferences) || {};
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spot.spots);

  const [useImages] = useImagesHook();
  const [useServerRequests] = useServerRequestsHook();

  useEffect(() => {
    console.log('datasets in useSpots UE', datasets);
  }, [datasets]);

  // Copy Spot to a new Spot omiting specific properties
  const copySpot = async () => {
    // Ids are generated in such quick succession here that using the getNewId function from Helpers.js doesn't
    // work since that is based on a timestamp
    const getNewCopyId = () => Math.floor(10000000000000 + Math.random() * 90000000000000);

    let copiedSpot = {'type': 'Feature'};
    let {name, id, date, time, modified_timestamp, images, samples, viewed_timestamp, lat, lng, altitude, gps_accuracy, spot_radius, ...properties} = selectedSpot.properties;
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
    dispatch(setSelectedSpot(newSpot));
    console.log('Spot Copied. New Spot', newSpot);
  };

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

    // Set spot name
    const defaultName = preferences.spot_prefix || 'Unnamed';
    const defaultNumber = preferences.starting_number_for_spot || Object.keys(spots).length + 1;
    newSpot.properties.name = defaultName + defaultNumber;
    const updatedPreferences = {...preferences, spot_prefix: defaultName, starting_number_for_spot: defaultNumber + 1};
    dispatch(updatedProject({field: 'preferences', value: updatedPreferences}));

    if (currentImageBasemap && newSpot.geometry && newSpot.geometry.type === 'Point') { //newSpot geometry is unavailable when spot is copied.
      const rootSpot = getRootSpot(currentImageBasemap.id);
      if (rootSpot) {
        newSpot.properties.lng = rootSpot.geometry.coordinates[0];
        newSpot.properties.lat = rootSpot.geometry.coordinates[1];
      }
    }
    console.log('Creating new Spot:', newSpot);
    await dispatch(addedSpot(newSpot));
    // const currentDataset = Object.values(datasets).find(dataset => dataset.current);
    const currentDataset = datasets[selectedDatasetId];
    console.log('Active Dataset', currentDataset);
    await dispatch(addedSpotsIdsToDataset({datasetId: currentDataset.id, spotIds: [newSpot.properties.id]}));
    console.log('Finished creating new Spot. All Spots: ', spots);
    return newSpot;
  };

  const deleteSpot = async spotId => {
    console.log(spotId);
    Object.values(datasets).map(dataset => {
      if (dataset.spotIds) {
        console.log(dataset.spotIds);
        const exists = dataset.spotIds.includes(spotId);
        if (exists) {
          console.log(dataset.id);
          console.log(dataset.spotIds.filter(id => spotId !== id));
          dispatch(deletedSpotIdFromDataset({spotId: spotId, dataset: dataset}));
          dispatch(deletedSpot(spotId));
        }
      }
    });
    return Promise.resolve('spot deleted');
  };

  const deleteSpotsFromDataset = (dataset, spotId) => {
    // const updatedSpotIds = dataset.spotIds.filter(id => id !== spotId);
    dispatch(deletedSpotIdFromDataset({spotId: spotId, dataset: dataset}));
    dispatch(deletedSpot(spotId));
    console.log(dataset, 'Spots', spots);
    return Promise.resolve(dataset.spotIds);
  };

  const downloadSpots = async (dataset, encodedLogin) => {
    const datasetInfoFromServer = await useServerRequests.getDatasetSpots(dataset.id, encodedLogin);
    if (!isEmpty(datasetInfoFromServer) && datasetInfoFromServer.features) {
      dispatch(addedStatusMessage({statusMessage: 'Downloading Spots...'}));
      const spotsOnServer = datasetInfoFromServer.features;
      if (!isEmpty(datasetInfoFromServer) && spotsOnServer) {
        console.log(spotsOnServer);
        dispatch(addedSpots(spotsOnServer));
        const spotIds = Object.values(spotsOnServer).map(spot => spot.properties.id);
        dispatch(addedSpotsIdsToDataset({datasetId: dataset.id, spotIds: spotIds}));
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: 'Downloaded Spots'}));
        const neededImagesIds = await useImages.gatherNeededImages(spotsOnServer);
        if (neededImagesIds.length === 0) {
          dispatch(setLoadingStatus({view: 'modal', bool: false}));
          dispatch(addedStatusMessage({statusMessage: 'No New Images to Download'}));
          dispatch(addedStatusMessage({statusMessage: 'Download Complete!'}));
        }
        else return await useImages.downloadImages(neededImagesIds);
        dispatch(setProjectLoadComplete(true));
      }
      return Promise.resolve({message: 'done - Spots'});
    }
    else {
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      return Promise.resolve('No Spots!');
    }

  };

  // Get only the Spots in the active Datasets
  const getActiveSpotsObj = () => {
    let activeSpots = {};
    // const activeSpotIds = Object.values(datasets).flatMap(dataset => dataset.active ? dataset.spotIds || [] : []);
    if (!isEmpty(datasets) && !isEmpty(activeDatasetsIds)) {
      const activeDatasets = activeDatasetsIds.map(datasetId => datasets[datasetId]);
      console.log('getActiveDatasetsFromId', activeDatasets);
      const activeSpotIds = activeDatasets.flatMap(dataset => {
        if (dataset.spotIds && !isEmpty(dataset.spotIds)) return dataset.spotIds;
        return;
      });
      activeSpotIds.map(spotId => {
        if (spots[spotId]) activeSpots = {...activeSpots, [spotId]: spots[spotId]};
        else console.log('Missing Spot', spotId);
      });
    }
    return activeSpots;
  };

  const getImageBasemaps = () => {
    return Object.values(getActiveSpotsObj()).reduce((acc, spot) => {
      const imageBasemaps = spot.properties.images
        && spot.properties.images.reduce((acc1, image) => {
          return image.annotated ? [...acc1, image] : acc1;
        }, []) || [];
      return [...acc, ...imageBasemaps];
    }, []);
  };

  const getMappableSpots = () => {
    const allSpotsCopy = JSON.parse(JSON.stringify(Object.values(getActiveSpotsObj())));
    if (currentImageBasemap) {
      return allSpotsCopy.filter(spot => {
        return spot.geometry
          && !spot.properties.strat_section_id && spot.properties.image_basemap === currentImageBasemap.id;
      });
    }
    return allSpotsCopy.filter(spot => {
      return spot.geometry && !spot.properties.strat_section_id && !spot.properties.image_basemap;
    });
  };

  // Find the rootSpot for a given image id.
  const getRootSpot = (imageId) => {
    let rootSpot, imageFound = false;
    const allSpots = getActiveSpotsObj();
    for (let index in allSpots) {
      let currentSpot = allSpots[index];
      let spotImages = currentSpot.properties.images;
      for (let imageIndex in spotImages) {
        let currentImage = spotImages[imageIndex];
        if (currentImage.id === imageId) imageFound = true;
      }
      if (imageFound) {
        rootSpot = currentSpot;
        break;
      }
    }
    if (rootSpot && rootSpot.properties.image_basemap) return getRootSpot(rootSpot.properties.image_basemap);
    return rootSpot;
  };

  const getSpotById = (spotId) => {
    return spots[spotId];
  };

  const getSpotByImageId = (imageId) => {
    return Object.values(getActiveSpotsObj()).find(spot => {
      return spot.properties.images && spot.properties.images.find(image => image.id === imageId);
    });
  };

  const getSpotDataIconSource = (iconKey) => {
    const iconSources = {...GENERAL_KEYS_ICONS, ...SED_KEYS_ICONS};
    if (iconSources[iconKey]) return iconSources[iconKey];
  };

  const getSpotDataKeys = (spot) => {
    let keysFound = Object.keys(spot.properties).filter(key => {
      return Object.keys(GENERAL_KEYS_ICONS).includes(key) && !isEmpty(spot.properties[key]);
    });
    if (spot.properties.sed) {
      const sedKeysFound = Object.keys(spot.properties.sed).filter(key => {
        return Object.keys(SED_KEYS_ICONS).includes(key) && !isEmpty(spot.properties.sed[key]);
      });
      keysFound = [...keysFound, ...sedKeysFound];
    }
    // console.log('Keys Found', keysFound);
    return keysFound;
  };

  const getSpotGemometryIconSource = (spot) => {
    if (spot.geometry && spot.geometry.type) {
      if (spot.geometry.type === 'Point') return require('../../assets/icons/Point_pressed.png');
      else if (spot.geometry.type === 'LineString') return require('../../assets/icons/Line_pressed.png');
      else if (spot.geometry.type === 'Polygon') return require('../../assets/icons/Polygon_pressed.png');
    }
    else return require('../../assets/icons/QuestionMark_pressed.png');
  };

  const getSpotsByIds = (spotIds) => {
    const foundSpots = [];
    Object.entries(spots).forEach(obj => {
      if (spotIds.includes(obj[1].properties.id)) foundSpots.push(obj[1]);
    });
    return foundSpots;
  };

  // Reverse chronologically sort active Spots
  const getSpotsSortedReverseChronologically = () => {
    return Object.values(getActiveSpotsObj()).sort(((a, b) => {
      return new Date(b.properties.date) - new Date(a.properties.date);
    }));
  };

  const getSpotsWithImages = () => {
    return Object.values(getActiveSpotsObj()).filter(spot => !isEmpty(spot.properties.images));
  };

  const getSpotsWithImagesSortedReverseChronologically = () => {
    return getSpotsWithImages().sort(((a, b) => {
      return new Date(b.properties.date) - new Date(a.properties.date);
    }));
  };

  return [{
    copySpot: copySpot,
    createSpot: createSpot,
    deleteSpot: deleteSpot,
    deleteSpotsFromDataset: deleteSpotsFromDataset,
    downloadSpots: downloadSpots,
    getActiveSpotsObj: getActiveSpotsObj,
    getImageBasemaps: getImageBasemaps,
    getMappableSpots: getMappableSpots,
    getRootSpot: getRootSpot,
    getSpotById: getSpotById,
    getSpotByImageId: getSpotByImageId,
    getSpotDataIconSource: getSpotDataIconSource,
    getSpotDataKeys: getSpotDataKeys,
    getSpotGemometryIconSource: getSpotGemometryIconSource,
    getSpotsByIds: getSpotsByIds,
    getSpotsSortedReverseChronologically: getSpotsSortedReverseChronologically,
    getSpotsWithImages: getSpotsWithImages,
    getSpotsWithImagesSortedReverseChronologically: getSpotsWithImagesSortedReverseChronologically,
  }];
};

export default useSpots;
