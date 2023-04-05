import {Alert} from 'react-native';

import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import KeepAwake from 'react-native-keep-awake';
import {useDispatch, useSelector} from 'react-redux';

import {addedStatusMessage, clearedStatusMessages, removedLastStatusMessage} from '../modules/home/home.slice';
import useImagesHook from '../modules/images/useImages';
import {
  deletedSpotIdFromDataset,
  setIsImageTransferring,
  updatedProjectTransferProgress,
} from '../modules/project/projects.slice';
import useProjectHook from '../modules/project/useProject';
import useSpotsHook from '../modules/spots/useSpots';
import {isEmpty} from '../shared/Helpers';
import {APP_DIRECTORIES} from './deviceAndAPI.constants';
import useServerRequestsHook from './useServerRequests';

const useUpload = () => {
  const datasetsNotUploaded = [];
  const tempImagesDownsizedDirectory = APP_DIRECTORIES.APP_DIR + '/TempImages';

  const dispatch = useDispatch();
  const projectDatasets = useSelector(state => state.project.datasets);
  const project = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);

  const [useServerRequests] = useServerRequestsHook();
  const [useSpots] = useSpotsHook();
  const [useImages] = useImagesHook();
  const [useProject] = useProjectHook();

  const initializeUpload = async () => {
    KeepAwake.activate();
    try {
      await uploadProject();
      const uploadStatus = await uploadDatasets();
      KeepAwake.deactivate();
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
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage(`Uploading dataset ${dataset.name}\n`));
      let datasetCopy = JSON.parse(JSON.stringify(dataset));
      delete datasetCopy.spotIds;
      datasetCopy.images && delete datasetCopy.images;
      const resJSON = await useServerRequests.updateDataset(datasetCopy, user.encoded_login);
      if (resJSON.modified_on_server) {
        console.log('Dataset that was uploaded:', resJSON);
        console.log(dataset.name + ': Uploading Dataset Properties...');
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage(`Uploading ${dataset.name} Properties...`));
        await useServerRequests.addDatasetToProject(project.id, dataset.id, user.encoded_login);
        console.log(`Finished Uploading Dataset ${dataset.name} Properties...`);
        dispatch(addedStatusMessage(`Finished Uploading Dataset ${dataset.name} Properties...\n`));
        await uploadSpots(dataset);
      }
      else {
        datasetsNotUploaded.push(datasetCopy);
        console.log(`Did not upload: Dataset ${datasetCopy.name} has not changed or is newer.`);
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
        dispatch(removedLastStatusMessage());
        currentRequest++;
        if (currentRequest < datasets.length) await makeNextDatasetRequest();
        else {
          const msgText = `Finished uploading ${datasets.length} Dataset${(datasets.length === 1 ? '!' : 's!')}\n`;
          console.log(msgText);
          // dispatch(removedLastStatusMessage());
          dispatch(clearedStatusMessages());
          dispatch(addedStatusMessage(msgText));
        }
      };

      if (Object.values(projectDatasets).length === 0) {
        console.log('No Datasets Found.');
        throw Error('No Datasets Found.');
      }
      else if (currentRequest < Object.values(projectDatasets).length) {
        const msgText = '\nFound ' + Object.values(projectDatasets).length + ' Dataset' + (Object.values(
          projectDatasets).length === 1 ? '' : 's') + ' to Upload.\n\n';
        console.log(msgText);
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage(msgText));
        await makeNextDatasetRequest();
        console.log('Completed Uploading Datasets!');
        return 'complete';
      }
    }
    catch (err) {
      console.error('Error uploading Datasets', err);
      throw Error(err);
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
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Finished Uploading Project Properties.'));
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
    let spots;
    dispatch(removedLastStatusMessage());
    if (dataset.spotIds) {
      spots = useSpots.getSpotsByIds(dataset.spotIds);
      spots.forEach(spotValue => useProject.checkValidDateTime(spotValue));
    }
    try {
      if (isEmpty(spots)) {
        console.log(dataset.name + ': No Spots to Upload.');
        dispatch(addedStatusMessage('There are no spots to upload.'));
        await useServerRequests.deleteAllSpotsInDataset(dataset.id, user.encoded_login);
        console.log(dataset.name + ': Finished Removing All Spots from Dataset on Server.');
      }
      else {
        const spotCollection = {
          type: 'FeatureCollection',
          features: Object.values(spots),
        };
        console.log(dataset.name + ': Uploading Spots...', spotCollection);
        dispatch(addedStatusMessage(`\nUploading ${dataset.name} spots...`));
        await useServerRequests.updateDatasetSpots(dataset.id, spotCollection, user.encoded_login);
        console.log(`Finished uploading ${dataset.name} spots.`);
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage(`\nFinished uploading ${dataset.name} spots.\n`));
        await uploadImages(Object.values(spots), dataset.name);
      }

    }
    catch (err) {
      console.error(dataset.name + ': Error Uploading Project Spots.', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(`${dataset.name}: Error Uploading Spots.\n\n ${err}\n`));
      // Added this below to handle spots that were getting added to 2 datasets, which the server will not accept
      if (err?.startsWith('Spot(s) already exist in another dataset')) {
        const spotId = parseInt(err.split(')')[1].split('(')[1].split(')')[0], 10);
        console.log('duppes', spotId);
        dispatch(deletedSpotIdFromDataset({datasetId: dataset.id, spotId: spotId}));
        Alert.alert('Fixed Spot in Another Dataset Error',
          'Spot removed from ' + dataset.name + '. Please try uploading again.');
      }
      throw Error(err);
    }
  };


  const uploadImages = async (spots, datasetName) => {
    let imagesFound = [];
    let imagesOnServer = [];
    let imagesToUpload = [];
    let imagesUploadedCount = 0;
    let imagesUploadFailedCount = 0;

    console.log(datasetName + ': Looking for Images to Upload in Spots...', spots);
    dispatch(addedStatusMessage('Looking for images to upload in spots...'));

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
        console.error('Error at shouldUploadImage()', err);
        imagesToUpload.push(imageProps);
      }
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
      let msgText = 'Uploading Images...';
      let countMsgText = `Image ${imagesUploadedCount} of ${imagesToUpload.length} uploaded.`;
      let failedCountMsgText = '';
      console.log(`${msgText} \n ${countMsgText}`);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(`${msgText} \n ${countMsgText}`));
      if (imagesUploadFailedCount > 0) {
        failedCountMsgText = ' (' + imagesUploadFailedCount + ' Failed)';
        dispatch(addedStatusMessage(`\n ${failedCountMsgText}`));
      }


      if (imagesUploadedCount + imagesUploadFailedCount < imagesToUpload.length) {
        await startUploadingImage(imagesToUpload[imagesUploadedCount + imagesUploadFailedCount]);
      }
      else {
        msgText = `Finished uploading images ${(imagesUploadFailedCount > 0 ? ' with Errors' : '') + '.'}`;
        console.log(msgText + '\n' + countMsgText);
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage(msgText + '\n' + countMsgText));
      }
    };

    // Get the URI of the image file if it exists on local device
    const getImageFile = async (imageProps) => {
      try {
        const imageURI = useImages.getLocalImageURI(imageProps.id);
        const isValidImageURI = await RNFS.exists(imageURI);
        if (isValidImageURI) return imageURI;
        throw Error;  // Webstorm giving warning here, but we want this caught locally so that we get the log
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
        dispatch(setIsImageTransferring(true));

        let formdata = new FormData();
        formdata.append('image_file', {uri: resizedImage.uri, name: 'image.jpg', type: 'image/jpeg'});
        formdata.append('id', imageId);
        formdata.append('modified_timestamp', Date.now());
        const res = await useServerRequests.uploadImage(formdata, user.encoded_login);
        console.log('Image Upload Res', res);
        console.log(datasetName + ': Finished Uploading Image', imageId);
        dispatch(updatedProjectTransferProgress(0));
        dispatch(clearedStatusMessages());
        dispatch(setIsImageTransferring(false));
      }
      catch (err) {
        console.log(datasetName + ': Error Uploading Image', imageId, err);
        dispatch(setIsImageTransferring(false));
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
    // Gather all the images in spots.
    spots.forEach(spot => spot?.properties?.images?.forEach(image => imagesFound.push(image)));
    console.log('SPOT IMAGES', imagesFound);

    await Promise.all(
      imagesFound.map(async (image) => {
        console.log('SHOULD UPLOAD IMAGE', image);
        await shouldUploadImage(image);
      }),
    );
    if (imagesToUpload.length > 0) {
      dispatch(removedLastStatusMessage());
      dispatch(
        addedStatusMessage(`Found ${imagesToUpload.length} image${imagesToUpload.length <= 1 ? '' : 's'} to upload.`),
      );
      await startUploadingImage(imagesToUpload[0]);
    }
    await deleteTempImagesFolder();
  };

  const uploadProfile = async (userValues) => {
    try {
      const profileData = {name: userValues.name, password: userValues.password, mapboxToken: userValues.mapboxToken};
      if (userValues.image) {
        const formData = new FormData();
        formData.append('image_file', {uri: userValues.image, name: 'image.jpg', type: 'image/jpeg'});
        await useServerRequests.uploadProfileImage(formData, user.encoded_login);
      }
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
