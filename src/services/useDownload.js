import {Platform} from 'react-native';

import {batch, useDispatch, useSelector} from 'react-redux';

import {APP_DIRECTORIES} from './directories.constants';
import useDeviceHook from './useDevice';
import useServerRequestsHook from './useServerRequests';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setErrorMessagesModalVisible,
  setLoadingStatus,
  setProjectLoadSelectionModalVisible,
  setStatusMessageModalTitle,
  setStatusMessagesModalVisible,
} from '../modules/home/home.slice';
import {initialProjectLoadModal} from '../modules/home/modals';
import useImagesHook from '../modules/images/useImages';
import {MAIN_MENU_ITEMS} from '../modules/main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage} from '../modules/main-menu-panel/mainMenuPanel.slice';
import {MAP_PROVIDERS} from '../modules/maps/maps.constants';
import {addedCustomMap, clearedMaps} from '../modules/maps/maps.slice';
import {
  addedNeededImagesToDataset,
  addedProject,
  addedSpotsIdsToDataset,
  clearedDatasets,
  setActiveDatasets,
  setSelectedDataset,
  updatedDatasets,
} from '../modules/project/projects.slice';
import {addedSpotsFromServer, clearedSpots} from '../modules/spots/spots.slice';
import {isEmpty} from '../shared/Helpers';

const useDownload = () => {
  let imagesDownloadedCount = 0;
  let imagesFailedCount = 0;
  let savedImagesCount = 0;
  let imageCount = 0;

  const dispatch = useDispatch();
  const encodedLogin = useSelector(state => state.user.encoded_login);
  const project = useSelector(state => state.project.project);

  const [useImages] = useImagesHook();
  const [useServerRequests] = useServerRequestsHook();
  const useDevice = useDeviceHook();

  const destroyOldProject = () => {
    batch(() => {
      // dispatch(clearedProject());
      dispatch(clearedSpots());
      dispatch(clearedDatasets());
      dispatch(clearedMaps());
    });
    console.log('Destroy batch complete');
  };

  // Download Project Properties
  const downloadProject = async (selectedProject) => {
    try {
      console.log('Downloading Project Properties...');
      dispatch(addedStatusMessage('Downloading Project Properties...'));
      const projectResponse = await useServerRequests.getProject(selectedProject.id, encodedLogin);
      if (!isEmpty(project)) destroyOldProject();
      dispatch(addedProject(projectResponse));
      const customMaps = projectResponse.other_maps;
      console.log('Finished Downloading Project Properties.', projectResponse);
      if (projectResponse.other_maps && !isEmpty(projectResponse.other_maps)) loadCustomMaps(customMaps);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished Downloading Project Properties.'));
      return projectResponse;
    }
    catch (err) {
      console.error('Error Downloading Project Properties.', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Downloading Project Properties. ' + err));
      throw Error;
    }
  };

  const downloadSpots = async (dataset) => {
    try {
      console.log(dataset.name, ':', 'Downloading Spots...');
      const downloadDatasetInfo = await useServerRequests.getDatasetSpots(dataset.id, encodedLogin);
      console.log(dataset.name, ':', 'Finished Downloading Spots.');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(`Finished Downloading Spots for ${dataset.name}.`));
      if (!isEmpty(downloadDatasetInfo) && downloadDatasetInfo.features) {
        const spotsOnServer = downloadDatasetInfo.features;
        console.log(dataset.name, ':', 'Spots Downloaded', spotsOnServer);
        dispatch(addedSpotsFromServer(spotsOnServer));
        const spotIds = Object.values(spotsOnServer).map(spot => spot.properties.id);
        dispatch(addedSpotsIdsToDataset(
          {datasetId: dataset.id, spotIds: spotIds, modified_timestamp: dataset.modified_timestamp}));
        await gatherNeededImages(spotsOnServer, dataset);
      }
      console.log(dataset.name, ':', 'downloadDatasetInfo', downloadDatasetInfo);
      return downloadDatasetInfo;
    }
    catch (err) {
      console.error(dataset.name, ':', 'Error Downloading Spots.', err);
      dispatch(addedStatusMessage('Error Downloading Spots.' + err));
      throw Error;
    }
  };

  const gatherNeededImages = async (spotsOnServer, dataset) => {
    try {
      console.log(dataset.name, ':', 'Gathering Needed Images...');
      const spotImages = await useImages.gatherNeededImages(spotsOnServer);
      console.log(dataset.name, ':', 'Images needed', spotImages.neededImagesIds.length, 'of',
        spotImages?.imageIds.length);
      dispatch(addedNeededImagesToDataset(
        {datasetId: dataset.id, images: spotImages, modified_timestamp: dataset.modified_timestamp}));
    }
    catch (err) {
      console.error(dataset.name, ':', 'Error Gathering Images. Error:', err);
    }
  };

  const downloadDatasets = async (selectedProject) => {
    try {
      dispatch(addedStatusMessage('Downloading datasets from server...'));
      const projectDatasetsFromServer = await useServerRequests.getDatasets(selectedProject.id, encodedLogin);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished downloading datasets from server.'));
      if (projectDatasetsFromServer.datasets.length === 1) {
        dispatch(setActiveDatasets({bool: true, dataset: projectDatasetsFromServer.datasets[0].id}));
        dispatch(setSelectedDataset(projectDatasetsFromServer.datasets[0].id));
      }
      const datasetsReassigned = Object.assign({},
        ...projectDatasetsFromServer.datasets.map(item => ({[item.id]: item})));
      dispatch(updatedDatasets(datasetsReassigned));
      await getDatasetSpots(datasetsReassigned);
      dispatch(addedStatusMessage('Finished gathering Needed Images...'));
      dispatch(addedStatusMessage('Finished downloading spots in dataset(s).'));
      return datasetsReassigned;
    }
    catch (e) {
      console.log('Error getting datasets...' + e);
      throw Error;
    }
  };

  const getDatasetSpots = async (datasets) => {
    if (Object.values(datasets).length >= 1) {
      console.log('Starting Dataset Spots Download!');
      dispatch(addedStatusMessage('Downloading Spots in datasets...'));
      dispatch(addedStatusMessage('Gathering Needed Images...'));

      // Synchronous download
      return await Object.values(datasets).reduce(async (previousPromise, dataset, i) => {
        await previousPromise;
        const datasetSpots = await downloadSpots(dataset);
        console.log(dataset.name, ':', 'Finished downloading and saving Spots', datasetSpots);
        return {dataset: dataset, spots: datasetSpots};
      }, Promise.resolve());
    }
  };

  const initializeDownload = async (selectedProject) => {
    const projectName = selectedProject.name || selectedProject?.description?.project_name || 'Unknown';
    batch(() => {
      if (initialProjectLoadModal) dispatch(setProjectLoadSelectionModalVisible(false));
      dispatch(setStatusMessageModalTitle(project.name));
      dispatch(clearedStatusMessages());
      if (Platform.OS !== 'web') dispatch(setStatusMessagesModalVisible(true));
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(addedStatusMessage(`Downloading Project: ${projectName}`));
    });
    try {
      await downloadProject(selectedProject);
      await downloadDatasets(selectedProject);
      console.log('Download Complete! Spots Downloaded!');
      batch(() => {
        dispatch(addedStatusMessage('------------------'));
        dispatch(addedStatusMessage('Downloading Datasets Complete!'));
        dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
        dispatch(setLoadingStatus({view: 'modal', bool: false}));
        // dispatch(setStatusMessagesModalVisible(false));
      });
    }
    catch (err) {
      console.error('Error Initializing Download.', err);
      if (Platform.OS === 'web') {
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage('Error loading project!', err));
        dispatch(setErrorMessagesModalVisible(true));
      }
      else dispatch(addedStatusMessage('Download Failed!', err));
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
    }
  };

  const initializeDownloadImages = async (neededImageIds, dataset) => {
    try {
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(clearedStatusMessages());
      dispatch(setStatusMessagesModalVisible(true));
      console.log('Downloading Needed Images...');
      dispatch(addedStatusMessage('Downloading Needed Images...'));
      if (!isEmpty(neededImageIds)) {
        // Check path first and if it doesn't exist, then create
        await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.IMAGES);
        await Promise.all(
          neededImageIds.map(async (imageId) => {
            // await downloadAndSaveImagesToDevice(imageId);
            const res = await useDevice.downloadAndSaveImage(imageId);
            imageCount++;
            if (res === 200) {
              imagesDownloadedCount++;
              savedImagesCount++;
              console.log(
                'NEW/MODIFIED Images Downloaded: ' + imagesDownloadedCount + ' of ' + neededImageIds.length
                + ' NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImageIds.length);
              dispatch(removedLastStatusMessage());
              dispatch(addedStatusMessage(
                'NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImageIds.length,
              ));
            }
            else {
              imagesFailedCount++;
              console.log('Downloaded Images ' + imageCount + '/' + neededImageIds.length
                + '\nFailed Images ' + imagesFailedCount + '/' + neededImageIds.length);
            }
          }),
        );

        dispatch(removedLastStatusMessage());
        if (imagesFailedCount > 0) {
          dispatch(setLoadingStatus({view: 'modal', bool: false}));
          dispatch(addedStatusMessage(
            'Downloaded Images ' + imageCount + '/' + neededImageIds.length
            + '\nFailed Images ' + imagesFailedCount + '/' + neededImageIds.length,
          ));
        }
        const neededDatasetImagesUpdated = await useImages.gatherNeededImages(null, dataset);
        console.log(neededDatasetImagesUpdated);
        dispatch(setLoadingStatus({view: 'modal', bool: false}));
        dispatch(addedNeededImagesToDataset({
          datasetId: dataset.id,
          images: neededDatasetImagesUpdated,
          modified_timestamp: dataset.modified_timestamp,
        }));
        dispatch(addedStatusMessage('Downloaded Images: ' + imageCount + '/' + neededImageIds.length));
      }
      dispatch(addedStatusMessage('\nAll needed images have been downloaded for this dataset'));
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
    }
    catch (err) {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Downloading Images!'));
      console.warn('Error Downloading Images: ' + err);
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
    }
  };

  const loadCustomMaps = (maps) => {
    maps.map((map) => {
      let mapId = map.id;
      // Pull out mapbox styles map id
      if (map.source === 'mapbox_styles' && map.id.includes('mapbox://styles/')) {
        mapId = map.id.split('/').slice(3).join('/');
      }
      const providerInfo = MAP_PROVIDERS[map.source];
      const customMap = {...map, ...providerInfo, id: mapId, key: map.accessToken, source: map.source};
      console.log(customMap);
      dispatch(addedCustomMap(customMap));
    });
  };

  return {
    initializeDownload: initializeDownload,
    initializeDownloadImages: initializeDownloadImages,
  };
};

export default useDownload;
