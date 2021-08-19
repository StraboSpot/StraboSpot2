import {Alert} from 'react-native';

import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import KeepAwake from 'react-native-keep-awake';
import {batch, useDispatch, useSelector} from 'react-redux';

import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setLoadingStatus,
  setStatusMessagesModalVisible,
  setUploadModalVisible,
} from '../modules/home/home.slice';
import useImagesHook from '../modules/images/useImages';
import {deletedSpotIdFromDataset} from '../modules/project/projects.slice';
import useProjectHook from '../modules/project/useProject';
import useSpotsHook from '../modules/spots/useSpots';
import {isEmpty} from '../shared/Helpers';
import useServerRequestsHook from './useServerRequests';

const useUpload = () => {
  const devicePath = RNFS.DocumentDirectoryPath;
  const appDirectory = '/StraboSpot';
  const tempImagesDownsizedDirectory = devicePath + appDirectory + '/TempImages';

  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);

  const [useServerRequests] = useServerRequestsHook();
  const [useSpots] = useSpotsHook();
  const [useImages] = useImagesHook();
  const [useProject] = useProjectHook();

  const initializeUpload = async () => {
    KeepAwake.activate();
    dispatch(setUploadModalVisible(false));
    dispatch(setLoadingStatus({view: 'modal', bool: true}));
    dispatch(clearedStatusMessages());
    dispatch(setStatusMessagesModalVisible(true));
    try {
      await uploadProject();
      await uploadDatasets();
      console.log('Upload Complete');
      batch(() => {
        dispatch(addedStatusMessage('Upload Complete!'));
        dispatch(addedStatusMessage('Project uploaded to server.'));
        dispatch(setLoadingStatus({view: 'modal', bool: false}));
        KeepAwake.deactivate();
      });
    }
    catch (err) {
      dispatch(addedStatusMessage('----------'));
      dispatch(addedStatusMessage('Upload Failed!'));
      console.error('Upload Failed!', err);
    }
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
  };

  const uploadDataset = async (dataset) => {
    try {
      console.log(dataset.name + ': Uploading Dataset Properties...');
      dispatch(addedStatusMessage('----------'));
      dispatch(addedStatusMessage(dataset.name + ': Uploading Dataset Properties...'));

      let datasetCopy = JSON.parse(JSON.stringify(dataset));
      delete datasetCopy.spotIds;
      datasetCopy.images && delete datasetCopy.images;

      await useServerRequests.updateDataset(datasetCopy, user.encoded_login);
      await useServerRequests.addDatasetToProject(project.id, dataset.id, user.encoded_login);
      console.log(dataset.name + ': Finished Uploading Dataset Properties...');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(dataset.name + ': Finished Uploading Dataset Properties.'));
    }
    catch (err) {
      console.error(dataset.name + ': Error Uploading Dataset Properties...', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(dataset.name + ': Error Uploading Dataset Properties.'));
      throw Error;
    }
    await uploadSpots(dataset);
  };

  // Synchronously Upload Datasets
  const uploadDatasets = async () => {
    let currentRequest = 0;
    const activeDatasets = useProject.getActiveDatasets();

    const makeNextDatasetRequest = async () => {
      await uploadDataset(activeDatasets[currentRequest]);
      currentRequest++;
      if (currentRequest < activeDatasets.length) await makeNextDatasetRequest();
      else {
        const msgText = 'Finished Uploading ' + activeDatasets.length + ' Dataset' + (activeDatasets.length === 1 ? '.' : 's.');
        console.log(msgText);
        dispatch(addedStatusMessage('----------'));
        dispatch(addedStatusMessage(msgText));
      }
    };

    if (activeDatasets.length === 0) {
      console.log('No Active Datasets Found.');
      dispatch(addedStatusMessage('No Active Datasets Found.'));
    }
    else if (currentRequest < activeDatasets.length) {
      const msgText = 'Found ' + activeDatasets.length + ' Active Dataset' + (activeDatasets.length ? '' : 's') + ' to Upload.';
      console.log(msgText);
      dispatch(addedStatusMessage(msgText));
      await makeNextDatasetRequest();
    }
  };

  // Upload Project Properties
  const uploadProject = async () => {
    try {
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(clearedStatusMessages());
      dispatch(setStatusMessagesModalVisible(true));
      console.log('Uploading Project Properties...');
      dispatch(addedStatusMessage('Uploading Project Properties...'));
      await useServerRequests.updateProject(project, user.encoded_login);
      console.log('Finished Uploading Project Properties...');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished Uploading Project Properties.'));
    }
    catch (err) {
      console.error('Error Uploading Project Properties.', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Error Uploading Project Properties.'));
      throw Error;
    }
  };

  // Upload Spots
  const uploadSpots = async (dataset) => {
    let spots;
    if (dataset.spotIds) {
      spots = useSpots.getSpotsByIds(dataset.spotIds);
      spots.forEach(spotValue => useProject.checkValidDateTime(spotValue));
    }
    try {
      if (isEmpty(spots)) {
        console.log(dataset.name + ': No Spots to Upload.');
        dispatch(addedStatusMessage(dataset.name + ': No Spots to Upload.'));
        await useServerRequests.deleteAllSpotsInDataset(dataset.id, user.encoded_login);
        console.log(dataset.name + ': Finished Removing All Spots from Dataset on Server.');
      }
      else {
        const spotCollection = {
          type: 'FeatureCollection',
          features: Object.values(spots),
        };
        console.log(dataset.name + ': Uploading Spots...', spotCollection);
        dispatch(addedStatusMessage(dataset.name + ': Uploading Spots...'));
        await useServerRequests.updateDatasetSpots(dataset.id, spotCollection, user.encoded_login);
        console.log(dataset.name + ': Finished Uploading Spots.');
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage(dataset.name + ': Finished Uploading Spots.'));
        await uploadImages(Object.values(spots), dataset.name);
      }

    }
    catch (err) {
      console.error(dataset.name + ': Error Uploading Project Spots.', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(`${dataset.name}: Error Uploading Spots.\n\n ${err}\n`));
      // Added this below to handle spots that were getting added to 2 datasets, which the server will not accept
      if (err.startsWith('Spot(s) already exist in another dataset')) {
        const spotId = parseInt(err.split(')')[1].split('(')[1].split(')')[0], 10);
        console.log('duppes', spotId);
        dispatch(deletedSpotIdFromDataset({datasetId: dataset.id, spotId: spotId}));
        Alert.alert('Fixed Spot in Another Dataset Error',
          'Spot removed from ' + dataset.name + '. Please try uploading again.');
      }
      throw Error;
    }
  };

  const uploadImages = async (spots, datasetName) => {
    let imagesOnServer = [];
    let imagesToUpload = [];
    let imagesUploadedCount = 0;
    let imagesUploadFailedCount = 0;
    let iSpotLoop = 0;
    let iImagesLoop = 0;

    console.log(datasetName + ': Looking for Images to Upload in Spots...', spots);
    dispatch(addedStatusMessage(datasetName + ': Looking for Images to Upload...'));

    const areMoreImages = (spot) => {
      return spot.properties && spot.properties.images && iImagesLoop < spot.properties.images.length;
    };

    const areMoreSpots = () => {
      return iSpotLoop + 1 < spots.length;
    };

    // Synchronously loop through spots and images finding images to upload
    const makeNextSpotRequest = async (spot) => {
      if (areMoreImages(spot)) {
        await shouldUploadImage(spot.properties.images[iImagesLoop]);
        await makeNextSpotRequest(spots[iSpotLoop]);
      }
      else if (areMoreSpots()) {
        iSpotLoop++;
        iImagesLoop = 0;
        await makeNextSpotRequest(spots[iSpotLoop]);
      }
      else {
        if (imagesToUpload.length === 0) {
          let msgText = datasetName + ': No NEW Images to Upload.';
          if (imagesOnServer.length === 0) msgText = datasetName + ': No Images in Spots.';
          console.log(msgText);
          dispatch(removedLastStatusMessage());
          dispatch(addedStatusMessage(msgText));
        }
        else {
          const msgText = datasetName + ': Found ' + imagesToUpload.length + ' Image'
            + (imagesToUpload.length === 1 ? '' : 's') + ' to Upload.';
          console.log(msgText, imagesToUpload);
          dispatch(removedLastStatusMessage());
          dispatch(addedStatusMessage(msgText));
        }
        if (imagesOnServer.length > 0) console.log(datasetName + ': Images Already on Server', imagesOnServer);
      }
    };

    // Check if image is already on server and push image into either array imagesOnServer or imagesToUpload
    const shouldUploadImage = async (imageProps) => {
      try {
        const response = await useServerRequests.verifyImageExistence(imageProps.id, user.encoded_login);
        if (response
          && ((response.modified_timestamp && imageProps.modified_timestamp
              && imageProps.modified_timestamp > response.modified_timestamp)
            || (!response.modified_timestamp && imageProps.modified_timestamp))) {
          imagesToUpload.push(imageProps);
        }
        else imagesOnServer.push(imageProps);
      }
      catch (err) {
        imagesToUpload.push(imageProps);
      }
      iImagesLoop++;
    };

    // Start uploading image by getting the image file, downsizing the image and then uploading
    const startUploadingImage = async (imageProps) => {
      try {
        const imageURI = await getImageFile(imageProps);
        const resizedImage = await resizeImageForUpload(imageProps, imageURI, datasetName);
        await uploadImage(imageProps.id, resizedImage);
        imagesUploadedCount++;
      }
      catch {
        imagesUploadFailedCount++;
      }
      let msgText = datasetName + ': Uploading Images...';
      let countMsgText = datasetName + ': Images Uploaded ' + imagesUploadedCount + '/' + imagesToUpload.length;
      if (imagesUploadFailedCount > 0) countMsgText += ' (' + imagesUploadFailedCount + ' Failed)';
      console.log(msgText + '\n' + countMsgText);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(msgText + '\n' + countMsgText));
      if (imagesUploadedCount + imagesUploadFailedCount < imagesToUpload.length) {
        await startUploadingImage(imagesToUpload[imagesUploadedCount + imagesUploadFailedCount]);
      }
      else {
        msgText = datasetName + ': Finished Uploading Images' + (imagesUploadFailedCount > 0 ? ' with Errors' : '') + '.';
        console.log(msgText + '\n' + countMsgText);
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage(msgText + '\n' + countMsgText));
      }
    };

    // Get the URI of the image file if it exists on local device
    const getImageFile = async (imageProps) => {
      try {
        const imageURI = await useImages.getLocalImageURI(imageProps.id);
        const isValidImageURI = await RNFS.exists(imageURI);
        if (isValidImageURI) return imageURI;
        throw Error;  // Webstorm giving warning here but we want this caught locally so we get the log
      }
      catch {
        console.log('Local file not found for image:' + imageProps.id);
        throw Error;
      }
    };

    // Upload the image to server
    const uploadImage = async (imageId, resizedImage) => {
      try {
        console.log(datasetName + ': Uploading Image', imageId, '...');

        let formdata = new FormData();
        formdata.append('image_file', {uri: resizedImage.uri, name: 'image.jpg', type: 'image/jpeg'});
        formdata.append('id', imageId);
        formdata.append('modified_timestamp', Date.now());
        await useServerRequests.uploadImage(formdata, user.encoded_login);
        console.log(datasetName + ': Finished Uploading Image', imageId);
      }
      catch (err) {
        console.log(datasetName + ': Error Uploading Image', imageId, err);
        throw Error;
      }
    };

    // Delete the folder used for downsized images
    const deleteTempImagesFolder = async () => {
      try {
        let dirExists = await RNFS.exists(tempImagesDownsizedDirectory);
        if (dirExists) await RNFS.unlink(tempImagesDownsizedDirectory);
      }
      catch {
        console.error(datasetName + ': Error Deleting Temp Images Folder.');
      }
    };
    if (spots.length > 0) await makeNextSpotRequest(spots[0]);
    if (imagesToUpload.length > 0) await startUploadingImage(imagesToUpload[0]);
    await deleteTempImagesFolder();
  };

  const uploadProfile = async (userValues) => {
    try {
      const profileData = {name: userValues.name, password: userValues.password, mapboxToken: userValues.mapboxToken};
      const formData = new FormData();
      formData.append('image_file', {uri: userValues.image, name: 'image.jpg', type: 'image/jpeg'});
      await useServerRequests.uploadProfileImage(formData, user.encoded_login);
      await useServerRequests.updateProfile(profileData);
    }
    catch (err) {
      console.error('Error uploading profile image', err);
      throw Error('Error uploading profile image', err);
    }
  };

  // Downsize image for upload
  const resizeImageForUpload = async (imageProps, imageURI, name) => {
    try {
      console.log(name + ': Resizing Image', imageProps.id, '...');
      let height = imageProps.height;
      let width = imageProps.width;

      if (!width || !height) ({width, height} = await useImages.getImageHeightAndWidth(imageURI));

      if (width && height) {
        const max_size = name === 'profileImage' ? 300 : 2000;
        if (width > height && width > max_size) {
          height = max_size * height / width;
          width = max_size;
        }
        else if (height > max_size) {
          width = max_size * width / height;
          height = max_size;
        }

        await RNFS.mkdir(tempImagesDownsizedDirectory);
        const createResizedImageProps = [imageURI, width, height, 'JPEG', 100, 0, tempImagesDownsizedDirectory];
        const resizedImage = await ImageResizer.createResizedImage(...createResizedImageProps);
        let imageSizeText;
        if (resizedImage.size < 1024) imageSizeText = resizedImage.size + ' bytes';
        else if (resizedImage.size < 1048576) imageSizeText = (resizedImage.size / 1024).toFixed(3) + ' kB';
        else if (resizedImage.size < 1073741824) imageSizeText = (resizedImage.size / 1048576).toFixed(2) + ' MB';
        else imageSizeText = (resizedImage.size / 1073741824).toFixed(3) + ' GB';
        console.log(name + ': Finished Resizing Image', imageProps.id, 'New Size', imageSizeText);
        return resizedImage;
      }
    }
    catch (err) {
      console.error('Error Resizing Image.', err);
      throw Error;
    }
  };

  return {
    initializeUpload: initializeUpload,
    uploadDatasets: uploadDatasets,
    uploadProfile: uploadProfile,
    uploadProject: uploadProject,
    resizeImageForUpload: resizeImageForUpload,
  };
};

export default useUpload;
