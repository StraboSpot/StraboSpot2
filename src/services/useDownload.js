import {Platform} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {useDispatch, useSelector} from 'react-redux';

import {APP_DIRECTORIES} from './directories.constants';
import useDeviceHook from './useDevice';
import useResetStateHook from './useResetState';
import useServerRequestsHook from './useServerRequests';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setIsErrorMessagesModalVisible,
  setIsProjectLoadSelectionModalVisible,
  setIsStatusMessagesModalVisible,
  setLoadingStatus,
  setStatusMessageModalTitle,
} from '../modules/home/home.slice';
import {useImages} from '../modules/images';
import {MAIN_MENU_ITEMS} from '../modules/main-menu-panel/mainMenu.constants';
import {setMenuSelectionPage} from '../modules/main-menu-panel/mainMenuPanel.slice';
import {MAP_PROVIDERS} from '../modules/maps/maps.constants';
import {addedCustomMapsFromBackup} from '../modules/maps/maps.slice';
import {
  addedDatasets,
  addedNeededImagesToDataset,
  addedProject,
  setActiveDatasets,
  setSelectedDataset,
} from '../modules/project/projects.slice';
import {addedSpotsFromServer} from '../modules/spots/spots.slice';
import {setUserData} from '../modules/user/userProfile.slice';
import {isEmpty} from '../shared/Helpers';

const useDownload = () => {
  let customMapsToSave = {};
  let datasetsObjToSave = {};
  let imagesDownloadedCount = 0;
  let imagesFailedCount = 0;
  let spotsToSave = [];

  const dispatch = useDispatch();
  const encodedLogin = useSelector(state => state.user.encoded_login);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const project = useSelector(state => state.project.project);

  const useDevice = useDeviceHook();
  const {gatherNeededImages} = useImages();
  const useResetState = useResetStateHook();
  const useServerRequests = useServerRequestsHook();

  const downloadDatasets = async (selectedProject) => {
    try {
      dispatch(addedStatusMessage('Downloading Datasets...'));
      const res = await useServerRequests.getDatasets(selectedProject.id, encodedLogin);
      const datasets = res?.datasets || [];
      if (datasets.length === 1) {
        dispatch(setActiveDatasets({bool: true, dataset: datasets[0].id}));
        dispatch(setSelectedDataset(datasets[0].id));
      }
      datasetsObjToSave = Object.assign({},
        ...datasets.map(item => ({[item.id]: {...item, modified_timestamp: item.modified_timestamp || Date.now()}})));
      await getDatasetSpots(datasets);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Downloaded ' + spotsToSave.length + ' Spots\nDownloaded '
        + Object.keys(datasetsObjToSave).length + ' Datasets\nFinished Downloading Datasets'));
    }
    catch (e) {
      console.log('Error getting datasets...' + e);
      throw Error;
    }
  };

  // Download Project Properties
  const downloadProject = async (selectedProject) => {
    try {
      console.log('Downloading Project Properties...');
      dispatch(addedStatusMessage('Downloading Project Properties...'));
      const projectResponse = await useServerRequests.getProject(selectedProject.id, encodedLogin);
      if (!isEmpty(project)) useResetState.clearProject();
      dispatch(addedProject(projectResponse));
      const customMaps = projectResponse.other_maps;
      console.log('Finished Downloading Project Properties.', projectResponse);
      if (projectResponse.other_maps && !isEmpty(projectResponse.other_maps)) loadCustomMaps(customMaps);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished Downloading Project Properties'));
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
      // console.log(dataset.name, ':', 'Downloading Spots...');
      const featureCollection = await useServerRequests.getDatasetSpots(dataset.id, encodedLogin);
      // console.log(dataset.name, ':', 'Finished Downloading Spots.');
      if (isEmpty(featureCollection) || !featureCollection.features) {
        // console.log(dataset.name, ': No Spots in dataset.');
      }
      else {
        const spotsDownloaded = featureCollection.features;
        const spotImages = await findNeededImages(spotsDownloaded, dataset);
        if (spotImages) datasetsObjToSave[dataset.id] = {...datasetsObjToSave[dataset.id], images: spotImages};
        spotsToSave.push(...spotsDownloaded);
        const spotIds = Object.values(spotsDownloaded).map(spot => spot.properties.id);
        datasetsObjToSave[dataset.id] = {...datasetsObjToSave[dataset.id], spotIds: spotIds};
        // console.log(dataset.name, ':', 'Got Spots', spotsDownloaded);
      }
    }
    catch (err) {
      console.error(dataset.name, ':', 'Error Downloading Spots.', err);
      dispatch(addedStatusMessage('Error Downloading Spots.' + err));
      throw Error;
    }
  };

  const downloadUserProfile = async (encodedLoginScoped = encodedLogin) => {
    try {
      let userProfileRes = await useServerRequests.getProfile(encodedLoginScoped);

      if (Platform.OS === 'web') {
        const userProfileImageBlob = await useServerRequests.getProfileImage(encodedLoginScoped);
        if (userProfileImageBlob) {
          const image = URL.createObjectURL(userProfileImageBlob);
          dispatch(setUserData({...userProfileRes, image: image, encoded_login: encodedLoginScoped}));
        }
        else dispatch(setUserData({...userProfileRes, encoded_login: encodedLoginScoped}));
      }
      else {
        await useDevice.downloadAndSaveProfileImage(encodedLoginScoped);
        dispatch(setUserData({...userProfileRes, encoded_login: encodedLoginScoped}));
      }

      Sentry.configureScope((scope) => {
        scope.setUser({'username': userProfileRes.name, 'email': userProfileRes.email});
      });
    }
    catch (err) {
      throw Error(err);
    }
  };

  const findNeededImages = async (spotsDownloaded, dataset) => {
    try {
      // console.log(dataset.name, ':', 'Gathering Needed Images...');
      const spotImages = await gatherNeededImages(spotsDownloaded, dataset);
      if (spotImages?.imageIds.length > 0) {
        // console.log(dataset.name, ':', 'Images needed', spotImages.neededImagesIds.length, 'of', spotImages?.imageIds.length);
        return spotImages;
      }
      else {
        console.log(dataset.name, ':', 'No Images in dataset.');
        return undefined;
      }
    }
    catch (err) {
      console.error(dataset.name, ':', 'Error Gathering Images. Error:', err);
    }
  };

  const getDatasetSpots = async (datasets) => {
    if (datasets.length >= 1) {
      // console.log('Starting Dataset Spots Download!');

      // Synchronous download
      await datasets.reduce(async (previousPromise, dataset, i) => {
        await previousPromise;
        await downloadSpots(dataset);
      }, Promise.resolve());
    }
  };

  const initializeDownload = async (selectedProject) => {
    const projectName = selectedProject.name || selectedProject?.description?.project_name || 'Unknown';
    if (isProjectLoadSelectionModalVisible) dispatch(setIsProjectLoadSelectionModalVisible(false));
    dispatch(setStatusMessageModalTitle(projectName));
    dispatch(clearedStatusMessages());
    if (Platform.OS !== 'web') dispatch(setIsStatusMessagesModalVisible(true));
    dispatch(setLoadingStatus({view: 'modal', bool: true}));
    dispatch(addedStatusMessage(`Downloading Project: ${projectName}`));
    try {
      await downloadProject(selectedProject);
      await downloadDatasets(selectedProject);
      console.log('Download Complete! Spots Downloaded!');
      dispatch(addedStatusMessage('------------------'));
      dispatch(addedSpotsFromServer(spotsToSave));
      dispatch(addedDatasets(datasetsObjToSave));
      dispatch(addedCustomMapsFromBackup(customMapsToSave));
      dispatch(addedStatusMessage('Complete!'));
      dispatch(setMenuSelectionPage({name: MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS}));
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
    }
    catch (err) {
      console.error('Error Initializing Download.', err);
      if (Platform.OS === 'web') {
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage('Error loading project!', err));
        dispatch(setIsErrorMessagesModalVisible(true));
      }
      else dispatch(addedStatusMessage('Download Failed!', err));
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      throw Error;
    }
  };

  const initializeDownloadImages = async (dataset) => {
    try {
      const neededImagesIds = dataset.images?.neededImagesIds;
      let updatedNeededImagesIds = JSON.parse(JSON.stringify(neededImagesIds));
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(clearedStatusMessages());
      dispatch(setIsStatusMessagesModalVisible(true));
      console.log('Downloading Needed Images...');
      dispatch(addedStatusMessage('Downloading Needed Images...'));
      if (!isEmpty(neededImagesIds)) {
        // Check path first and if it doesn't exist, then create
        await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.IMAGES);
        for (const imageId of updatedNeededImagesIds) {
          const imageUrl = await useServerRequests.getImageUrl();
          const success = await useDevice.downloadImageAndSave(imageUrl + imageId, imageId);
          if (success) {
            imagesDownloadedCount++;
            updatedNeededImagesIds = updatedNeededImagesIds.filter(id => id !== imageId);
            dispatch(addedNeededImagesToDataset({
              datasetId: dataset.id,
              images: {...dataset.images, neededImagesIds: updatedNeededImagesIds},
              modified_timestamp: dataset.modified_timestamp,
            }));
          }
          else imagesFailedCount++;
          console.log('New/Modified Images Saved: ' + imagesDownloadedCount + '/'
            + neededImagesIds.length + ' Images Failed: ' + imagesFailedCount + '/' + neededImagesIds.length);
          dispatch(removedLastStatusMessage());
          dispatch(addedStatusMessage('New/Modified Images Saved: ' + imagesDownloadedCount + ' / '
            + neededImagesIds.length + '\n Images Failed: ' + imagesFailedCount + '/' + neededImagesIds.length));
        }

        dispatch(removedLastStatusMessage());
        if (imagesFailedCount > 0) {
          dispatch(addedStatusMessage('Finished downloading images but with failures.\nDownloaded Images '
            + imagesDownloadedCount + '/' + neededImagesIds.length + '\nFailed Images ' + imagesFailedCount + '/'
            + neededImagesIds.length));
        }
        else {
          dispatch(
            addedStatusMessage('Finished downloading images: ' + imagesDownloadedCount + '/' + neededImagesIds.length));
          dispatch(setLoadingStatus({view: 'modal', bool: false}));
        }
        dispatch(addedStatusMessage('Complete!'));
        dispatch(addedStatusMessage('\nAll needed images have been downloaded for this dataset'));
        dispatch(setLoadingStatus({view: 'modal', bool: false}));
      }
    }
    catch (err) {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Downloading Images!'));
      dispatch(addedStatusMessage('Complete!'));
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
      const customMap = {
        ...map,
        ...providerInfo,
        id: mapId,
        key: map.accessToken || map.key,
        source: map.source,
      };
      console.log(customMap);
      customMapsToSave = {...customMapsToSave, [customMap.id]: customMap};
    });
  };

  return {
    downloadUserProfile: downloadUserProfile,
    initializeDownload: initializeDownload,
    initializeDownloadImages: initializeDownloadImages,
  };
};

export default useDownload;
