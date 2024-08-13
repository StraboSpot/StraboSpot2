import {Platform} from 'react-native';

import KeepAwake from 'react-native-keep-awake';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequestsHook from './useServerRequests';
import useUploadImagesHook from './useUploadImages';
import {addedStatusMessage, clearedStatusMessages, removedLastStatusMessage} from '../modules/home/home.slice';
import {deletedSpotIdFromDataset, setIsImageTransferring} from '../modules/project/projects.slice';
import useProjectHook from '../modules/project/useProject';
import useSpotsHook from '../modules/spots/useSpots';
import {isEmpty} from '../shared/Helpers';
import alert from '../shared/ui/alert';

const useUpload = () => {
  const datasetsNotUploaded = [];

  const dispatch = useDispatch();
  const projectDatasets = useSelector(state => state.project.datasets);
  const project = useSelector(state => state.project.project);
  const spots = useSelector(state => state.spot.spots);
  const user = useSelector(state => state.user);

  const useProject = useProjectHook();
  const useServerRequests = useServerRequestsHook();
  const useSpots = useSpotsHook();
  const useUploadImages = useUploadImagesHook();

  const initializeUpload = async () => {
    Platform.OS !== 'web' && KeepAwake.activate();
    try {
      await uploadProject();
      const uploadStatus = await uploadDatasets();
      await useUploadImages.uploadImages(Object.values(spots));
      dispatch(setIsImageTransferring(false));
      Platform.OS !== 'web' && KeepAwake.deactivate();
      return {status: uploadStatus, datasets: datasetsNotUploaded};
    }
    catch (err) {
      dispatch(addedStatusMessage(`\nUpload Failed!\n\n ${err}`));
      console.error('Upload Failed!', err);
      throw Error(err);
    }
  };

  const uploadDataset = async (dataset) => {
    try {
      // dispatch(addedStatusMessage(`\n${dataset.name}\n`));
      let datasetCopy = JSON.parse(JSON.stringify(dataset));
      delete datasetCopy.spotIds;
      datasetCopy.images && delete datasetCopy.images;
      const resJSON = await useServerRequests.updateDataset(datasetCopy, user.encoded_login);
      if (resJSON.modified_on_server) {
        console.log('Dataset that was uploaded:', resJSON);
        // console.log(dataset.name + ': Uploading Dataset Properties...');
        // dispatch(addedStatusMessage('Uploading properties...'));
        await useServerRequests.addDatasetToProject(project.id, dataset.id, user.encoded_login);
        // console.log(`Finished Uploading Dataset ${dataset.name} Properties...`);
        // dispatch(removedLastStatusMessage());
        await uploadSpots(dataset);
      }
      else {
        datasetsNotUploaded.push(datasetCopy);
        // console.log(`Did not upload: Dataset ${datasetCopy.name} has not changed or is newer.`);
      }
    }
    catch (err) {
      console.error(dataset.name + ': Error Uploading Dataset Properties...', err);
      // dispatch(addedStatusMessage(`Error Uploading Dataset Properties!\n ${err}`));
      throw Error(err);
    }
  };

  // Synchronously Upload Datasets
  const uploadDatasets = async () => {
    try {
      let currentRequest = 0;
      const datasets = Object.values(projectDatasets);

      const makeNextDatasetRequest = async () => {
        await uploadDataset(datasets[currentRequest]);
        currentRequest++;
        if (currentRequest < datasets.length) await makeNextDatasetRequest();
        // else {
        //   const msgText = `Finished uploading ${datasets.length} Dataset${(datasets.length === 1 ? '!' : 's!')}\n`;
        //   console.log(msgText);
        //   // dispatch(removedLastStatusMessage());
        //   dispatch(clearedStatusMessages());
        //   dispatch(addedStatusMessage(msgText));
        // }
      };

      if (Object.values(projectDatasets).length === 0) {
        console.log('No Datasets Found.');
        throw Error('No Datasets Found.');
      }
      else if (currentRequest < Object.values(projectDatasets).length) {
        // const msgText = '\nFound ' + Object.values(projectDatasets).length + ' Dataset' + (Object.values(
        //   projectDatasets).length === 1 ? '' : 's') + ' to Upload.\n\n';
        // console.log(msgText);
        // dispatch(removedLastStatusMessage());
        // dispatch(addedStatusMessage(msgText));
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage(`Uploading ${datasets.length} datasets...\n`));
        await makeNextDatasetRequest();
        dispatch(removedLastStatusMessage());
        console.log('Completed Uploading Datasets!');
        dispatch(addedStatusMessage(`Finished uploading ${datasets.length} Dataset${(datasets.length === 1 ? '!' : 's!')}\n`));
        return 'complete';
      }
    }
    catch (err) {
      console.error('Error uploading Datasets', err);
      throw Error(err);
    }
  };

  const uploadFromWeb = async (imageId, imageFile) => {
    try {
      dispatch(setIsImageTransferring(true));
      let formData = new FormData();
      formData.append('name', imageFile.name);
      formData.append('image_file', imageFile);
      formData.append('id', imageId);
      formData.append('modified_timestamp', Date.now());

      const res = await useServerRequests.uploadWebImage(formData, user.encoded_login);
      console.log('Image Upload Res', res);
      return res;
    }
    catch (err) {
      console.log('Error Uploading Image', err);
      dispatch(setIsImageTransferring(false));
      throw Error;
    }
  };

  const uploadProfile = async (userValues) => {
    try {
      const profileData = {name: userValues.name, password: userValues.password, mapboxToken: userValues.mapboxToken};
      await useServerRequests.updateProfile(profileData);
    }
    catch (err) {
      console.error('Error uploading profile image', err);
      throw Error('Error uploading profile image', err);
    }
  };

  // Upload Project Properties
  const uploadProject = async () => {
    try {
      dispatch(clearedStatusMessages());
      console.log('Uploading Project Properties...');
      dispatch(addedStatusMessage('Uploading Project Properties...'));
      await useServerRequests.updateProject(project, user.encoded_login);
      console.log('Finished Uploading Project Properties...');
      // dispatch(removedLastStatusMessage());
      // dispatch(addedStatusMessage('Finished Uploading Project Properties.'));
    }
    catch (err) {
      console.error('Error Uploading Project Properties.', err);
      dispatch(clearedStatusMessages());
      let errMessage = 'Uploading Project Properties.';
      errMessage = err ? errMessage + '\n\n' + err + '\n\n' : errMessage;
      throw Error(errMessage);
    }
  };

  // Upload Spots
  const uploadSpots = async (dataset) => {
    let datasetSpots;
    dispatch(removedLastStatusMessage());
    if (dataset.spotIds) {
      datasetSpots = useSpots.getSpotsByIds(dataset.spotIds);
      datasetSpots.forEach(spotValue => useProject.checkValidDateTime(spotValue));
    }
    try {
      if (isEmpty(datasetSpots)) {
        // console.log(dataset.name + ': No Spots to Upload.');
        dispatch(addedStatusMessage('There are no spots to upload.'));
        await useServerRequests.deleteAllSpotsInDataset(dataset.id, user.encoded_login);
        // console.log(dataset.name + ': Finished Removing All Spots from Dataset on Server.');
      }
      else {
        const spotCollection = {
          type: 'FeatureCollection',
          features: Object.values(datasetSpots),
        };
        console.log(dataset.name + ': Uploading Spots...', spotCollection);
        dispatch(addedStatusMessage(`\nUploading ${dataset.name}\nspots...\n`));
        await useServerRequests.updateDatasetSpots(dataset.id, spotCollection, user.encoded_login);
        // console.log(`Finished uploading ${dataset.name} spots.`);
        // dispatch(removedLastStatusMessage());
        // dispatch(addedStatusMessage('\nFinished uploading spots.\n'));
        // await uploadImages(Object.values(datasetSpots), dataset.name);
      }
    }
    catch (err) {
      // console.error(dataset.name + ': Error Uploading Project Spots.', err);
      // dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(`${dataset.name}: Error Uploading Spots.\n\n ${err}\n`));
      // Added this below to handle spots that were getting added to 2 datasets, which the server will not accept
      if (err?.startsWith('Spot(s) already exist in another dataset')) {
        const spotId = parseInt(err.split(')')[1].split('(')[1].split(')')[0], 10);
        // console.log('dupes', spotId);
        dispatch(deletedSpotIdFromDataset({datasetId: dataset.id, spotId: spotId}));
        alert('Fixed Spot in Another Dataset Error',
          'Spot removed from ' + dataset.name + '. Please try uploading again.');
      }
      throw Error(err);
    }
  };

  return {
    initializeUpload: initializeUpload,
    uploadDatasets: uploadDatasets,
    uploadFromWeb: uploadFromWeb,
    uploadProfile: uploadProfile,
    uploadProject: uploadProject,
  };
};

export default useUpload;
