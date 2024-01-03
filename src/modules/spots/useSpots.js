import * as Sentry from '@sentry/react-native';
import {batch, useDispatch, useSelector} from 'react-redux';

import {deletedSpot, editedOrCreatedSpot, setSelectedSpot} from './spots.slice';
import {getNewId, isEmpty, isEqual} from '../../shared/Helpers';
import alert from '../../shared/ui/alert';
import {setModalVisible} from '../home/home.slice';
import {MODAL_KEYS, PAGE_KEYS} from '../page/page.constants';
import {
  addedDataset,
  addedSpotsIdsToDataset,
  deletedSpotIdFromDatasets,
  deletedSpotIdFromTags,
  setActiveDatasets,
  setSelectedDataset,
  updatedModifiedTimestampsBySpotsIds,
  updatedProject,
} from '../project/projects.slice';
import useProjectHook from '../project/useProject';
import {useTagsHook} from '../tags';

const useSpots = () => {
  const [useProject] = useProjectHook();
  const useTags = useTagsHook();

  const dispatch = useDispatch();
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);
  const datasets = useSelector(state => state.project.datasets);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const preferences = useSelector(state => state.project.project.preferences) || {};
  const tags = useSelector(state => state.project.project.tags) || [];
  const useContinuousTagging = useSelector(state => state.project.project.useContinuousTagging);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spot.spots);

  const checkIsSafeDelete = (spotToDelete) => {
    // Check if Spot is manually nested - get the first Spot that has this Spot nested manually in spot.properties.nesting
    const spotWithManualNest = Object.values(spots).find(
      spot => spot.properties?.nesting?.includes(spotToDelete.properties.id));
    if (spotWithManualNest) {
      return 'Remove the link to this Spot from the Samples page in Spot ' + spotWithManualNest.properties.name
        + ' before deleting.';
    }
    if (spotToDelete.properties?.sed?.strat_section) return 'Remove the strat section from this Spot before deleting.';
    if (!isEmpty(spotToDelete.properties?.images)) return `Remove all ${(spotToDelete.properties.images).length} images from this Spot before deleting.`;
    //var childrenSpots = getChildrenGenerationsSpots(spotToDelete, 1)[0];
    // Get only children that are mapped on an image basemap or strat section which is
    // different from the image basemap or strat section of the Spot being deleted
    // var altMappedChildrenSpots = _.filter(childrenSpots, function (spot) {
    //   return spotToDelete.properties.imageBasemap !== spot.properties.image_basemap || spotToDelete.properties.strat_section_id !== spot.properties.strat_section_id;
    // });
    // if (!_.isEmpty(altMappedChildrenSpots)) return 'Delete the nested Spots for this Spot before deleting.';

    return null;
  };

  // Copy Spot to a new Spot omiting specific properties
  const copySpot = async () => {
    let copiedSpot = {'type': 'Feature'};
    let {
      name,
      id,
      date,
      time,
      modified_timestamp,
      images,
      samples,
      viewed_timestamp,
      lat,
      lng,
      altitude,
      gps_accuracy,
      orientation_data,
      spot_radius,
      ...properties
    } = selectedSpot.properties;
    copiedSpot.properties = properties;
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
    if (!newSpot.properties.name) {
      const defaultName = preferences.spot_prefix || 'Unnamed';
      const defaultNumber = preferences.starting_number_for_spot || Object.keys(spots).length + 1;
      newSpot.properties.name = defaultName + defaultNumber;
      let updatedPreferences = {
        ...preferences,
        spot_prefix: defaultName,
        starting_number_for_spot: defaultNumber + 1,
      };
      if (modalVisible === MODAL_KEYS.SHORTCUTS.SAMPLE) {
        updatedPreferences = {
          ...updatedPreferences,
          sample_prefix: preferences.sample_prefix || 'Unnamed',
          starting_sample_number: (preferences.starting_sample_number || 1) + 1,
        };
      }
      dispatch(updatedProject({field: 'preferences', value: updatedPreferences}));
    }

    if ((currentImageBasemap || stratSection) && newSpot.geometry && newSpot.geometry.type === 'Point') { //newSpot geometry is unavailable when spot is copied.
      const rootSpot = currentImageBasemap ? getRootSpot(currentImageBasemap.id)
        : getSpotWithThisStratSection(stratSection.strat_section_id);
      if (rootSpot && rootSpot.geometry && rootSpot.geometry.type === 'Point') {
        newSpot.properties.lng = rootSpot.geometry.coordinates[0];
        newSpot.properties.lat = rootSpot.geometry.coordinates[1];
      }
    }
    // Continuous tagging
    if (useContinuousTagging) {
      let continuousTaggingList = tags.filter(tag => tag.continuousTagging);
      useTags.addSpotsToTags(continuousTaggingList, [newSpot]);
    }
    console.log('Creating new Spot:', newSpot);
    dispatch(updatedModifiedTimestampsBySpotsIds([newSpot.properties.id]));
    let currentDataset = datasets[selectedDatasetId];
    if (isEmpty(currentDataset)) {
      alert('No Active Dataset Selected. Created a new Default Dataset for new Spot.');
      currentDataset = useProject.createDataset();
      batch(() => {
        dispatch(addedDataset(currentDataset));
        dispatch(setActiveDatasets({bool: true, dataset: currentDataset.id}));
        dispatch(setSelectedDataset(currentDataset.id));
      });
    }
    console.log('Active Dataset', currentDataset);
    dispatch(addedSpotsIdsToDataset({datasetId: currentDataset.id, spotIds: [newSpot.properties.id]}));
    dispatch(editedOrCreatedSpot(newSpot));
    console.log('Finished creating new Spot. All Spots: ', spots);
    return newSpot;
  };

  const deleteSpot = (spotId) => {
    console.log('Deleting Spot ID', spotId, '...');
    dispatch(deletedSpotIdFromTags(spotId));
    dispatch(deletedSpotIdFromDatasets(spotId));
    dispatch(deletedSpot(spotId));
    dispatch(setModalVisible({modal: null}));
  };

  // Get only the Spots in the active Datasets
  const getActiveSpotsObj = () => {
    let activeSpots = {};
    const activeDatasets = useProject.getActiveDatasets();
    //console.log('getActiveDatasetsFromId', activeDatasets);
    const activeSpotIds = Object.values(activeDatasets).reduce((acc, dataset) => {
      return (dataset && dataset.spotIds && !isEmpty(dataset.spotIds)) ? [...acc, ...dataset.spotIds] : acc;
    }, []);
    // Check for undefined Spot Ids and Spots referenced in a dataset but do not exist in the spots object
    activeSpotIds.map((spotId) => {
      if (spots[spotId]) activeSpots = {...activeSpots, [spotId]: spots[spotId]};
      else console.log('Missing Spot', spotId);
    });
    return activeSpots;
  };

  const getAllFeaturesFromSpot = (spotToEvaluate) => {
    let spotsToEvaluate;
    let allFeatures = [];
    if (isEmpty(spotToEvaluate)) spotsToEvaluate = Object.values(getActiveSpotsObj());
    else spotsToEvaluate = [spotToEvaluate];
    let featureElements = [PAGE_KEYS.MEASUREMENTS, PAGE_KEYS.OTHER_FEATURES, PAGE_KEYS.THREE_D_STRUCTURES];
    spotsToEvaluate.forEach((spot) => {
      featureElements.map((featureElement) => {
        if (spot.properties[featureElement]) {
          let featuresCopy = JSON.parse(JSON.stringify(spot.properties[featureElement]));
          featuresCopy.map((featureCopy) => {
            featureCopy.parentSpotId = spot.properties.id;
          });
          allFeatures = allFeatures.concat(featuresCopy);
        }
      });
    });
    return JSON.parse(JSON.stringify(allFeatures)).slice(0, 25);
  };

  const getAllSpotSamplesCount = async () => {
    // let spotsObjArr = [];
    let samplesArr = [];
    //get all datasets with spots
    await Promise.all(Object.values(datasets).filter((dataset) => {
        if (!isEmpty(dataset.spotIds)) {
          dataset.spotIds.map(async (spotId) => {
            const spotObj = await getSpotById(spotId);
            if (!isEmpty(spotObj?.properties?.samples)) {
              spotObj.properties.samples.map((sample) => {
                samplesArr.push(sample);
                console.log(1);
              });
              console.log(2);
            }
            console.log(3);
          });
          console.log(4);
        }
      }),
    );
    console.log(5);
    console.log('SamplesArr', samplesArr.length);
    return samplesArr.length;

    //filter out spots with samples in separate array

    //get the length of the array
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

  // Get Interval Spots on a given Strat Section
  const getIntervalSpotsThisStratSection = (stratSectionId) => {
    return Object.values(getActiveSpotsObj()).filter((s) => {
      return s.properties.strat_section_id === stratSectionId
        && s.properties.surface_feature?.surface_feature_type === 'strat_interval';
    });
  };

  // Get Active Spots with Valid Geometry
  const getMappableSpots = () => {
    const allSpotsCopy = JSON.parse(JSON.stringify(Object.values(getActiveSpotsObj())));
    const allSpotsCopyFiltered = allSpotsCopy.filter((spot) => {
      const geometries = spot.geometry?.geometries || [spot.geometry] || [];
      let hasValidGeometry = true;
      geometries.forEach((g) => {
        const coordsFlat = g?.coordinates?.flat(Infinity) || [];
        const coordsFlatValid = coordsFlat.filter(c => c !== null && c !== undefined && !Number.isNaN(c));
        if (!hasValidGeometry || isEmpty(coordsFlat) || !isEqual(coordsFlat, coordsFlatValid)) hasValidGeometry = false;
      });
      if (spot.geometry && !hasValidGeometry) {
        alert('Invalid Geometry', 'Found a Spot with invalid geometry. Unable to map this Spot.'
          + '\nSpot Name: ' + spot.properties.name);
        console.error('INVALID Geometry! Spot:', spot);
      }
      return hasValidGeometry;
    });
    console.log('Spots with Valid Geometry:', allSpotsCopyFiltered);
    return allSpotsCopyFiltered;
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
    if (spots[spotId]) return spots[spotId];
    else Sentry.captureMessage(`Missing Spot ${spotId}`);
  };

  const getSpotByImageId = (imageId) => {
    return Object.values(getActiveSpotsObj()).find((spot) => {
      return spot.properties.images && spot.properties.images.find(image => image.id === imageId);
    });
  };


  const getSpotGeometryIconSource = (spot) => {
    if (spot?.geometry?.type === 'Point') {
      if (spot.properties?.image_basemap) return require('../../assets/icons/ImagePoint_pressed.png');
      else if (spot.properties?.strat_section_id) return require('../../assets/icons/StratPoint_pressed.png');
      else return require('../../assets/icons/Point_pressed.png');
    }
    else if (spot?.geometry?.type === 'LineString') {
      if (spot.properties?.image_basemap) return require('../../assets/icons/ImageLine_pressed.png');
      else if (spot.properties?.strat_section_id) return require('../../assets/icons/StratLine_pressed.png');
      else return require('../../assets/icons/Line_pressed.png');
    }
    else if (spot?.geometry?.type === 'Polygon' || spot?.geometry?.type === 'GeometryCollection') {
      if (spot.properties?.image_basemap) return require('../../assets/icons/ImagePolygon_pressed.png');
      else if (spot.properties?.strat_section_id) return require('../../assets/icons/StratPolygon_pressed.png');
      else return require('../../assets/icons/Polygon_pressed.png');
    }
    else return require('../../assets/icons/QuestionMark_pressed.png');
  };

  // Get the Spot that Contains a Specific Strat Section Given the ID of the Strat Section
  const getSpotWithThisStratSection = (stratSectionId) => {
    const activeSpots = getActiveSpotsObj();
    // Comparing int to string so use only 2 equal signs
    return (
      Object.values(activeSpots).find(spot => spot?.properties?.sed?.strat_section?.strat_section_id == stratSectionId)
    );
  };

  const getSpotsByIds = (spotIds) => {
    const foundSpots = [];
    Object.entries(spots).forEach((obj) => {
      if (spotIds.includes(obj[1].properties.id)) foundSpots.push(obj[1]);
    });
    return foundSpots;
  };

  // Get all the Spots mapped on a specific strat section
  const getSpotsMappedOnGivenStratSection = (stratSectionId) => {
    return Object.values(spots).reduce((acc, s) => {
      return s.properties?.strat_section_id == stratSectionId ? [...acc, s] : acc;
    }, []);
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

  const getSpotsWithKey = (key) => {
    return Object.values(getActiveSpotsObj()).filter(spot => !isEmpty(spot.properties[key]));
  };

  const getSpotsWithSamples = () => {
    return Object.values(getActiveSpotsObj()).filter(spot => !isEmpty(spot.properties.samples));
  };

  const getSpotsWithSamplesSortedReverseChronologically = () => {
    return getSpotsWithSamples().sort(((a, b) => {
      return new Date(b.properties.date) - new Date(a.properties.date);
    }));
  };

  // Get all active Spot that contain a strat section
  const getSpotsWithStratSection = () => {
    const activeSpots = getActiveSpotsObj();
    return Object.values(activeSpots).filter(spot => spot?.properties?.sed?.strat_section);
  };

  const isStratInterval = (spot) => {
    return spot?.properties?.strat_section_id && spot?.properties?.surface_feature?.surface_feature_type === 'strat_interval';
  };

  const saveSpot = () => {

  };

  return {
    checkIsSafeDelete: checkIsSafeDelete,
    copySpot: copySpot,
    createSpot: createSpot,
    deleteSpot: deleteSpot,
    getActiveSpotsObj: getActiveSpotsObj,
    getAllFeaturesFromSpot: getAllFeaturesFromSpot,
    getAllSpotSamplesCount: getAllSpotSamplesCount,
    getImageBasemaps: getImageBasemaps,
    getIntervalSpotsThisStratSection: getIntervalSpotsThisStratSection,
    getMappableSpots: getMappableSpots,
    getRootSpot: getRootSpot,
    getSpotById: getSpotById,
    getSpotByImageId: getSpotByImageId,
    getSpotGemometryIconSource: getSpotGeometryIconSource,
    getSpotWithThisStratSection: getSpotWithThisStratSection,
    getSpotsByIds: getSpotsByIds,
    getSpotsMappedOnGivenStratSection: getSpotsMappedOnGivenStratSection,
    getSpotsSortedReverseChronologically: getSpotsSortedReverseChronologically,
    getSpotsWithImages: getSpotsWithImages,
    getSpotsWithImagesSortedReverseChronologically: getSpotsWithImagesSortedReverseChronologically,
    getSpotsWithKey: getSpotsWithKey,
    getSpotsWithSamples: getSpotsWithSamples,
    getSpotsWithSamplesSortedReverseChronologically: getSpotsWithSamplesSortedReverseChronologically,
    getSpotsWithStratSection: getSpotsWithStratSection,
    isStratInterval: isStratInterval,
    saveSpot: saveSpot,
  };
};

export default useSpots;
