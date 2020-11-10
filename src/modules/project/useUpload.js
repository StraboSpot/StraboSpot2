import {Platform} from 'react-native';

import ImageResizer from 'react-native-image-resizer';
import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import useServerRequestsHook from '../../services/useServerRequests';
import {isEmpty} from '../../shared/Helpers';
import {addedStatusMessage, removedLastStatusMessage} from '../home/home.slice';
import useImagesHook from '../images/useImages';
import useProjectHook from '../project/useProject';
import useSpotsHook from '../spots/useSpots';


const RNFS = require('react-native-fs');

const useUpload = () => {
  const dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectory = '/StraboSpot';
  const tempImagesDownsizedDirectory = devicePath + appDirectory + '/TempImages';

  const dispatch = useDispatch();
  const activeDatasetsIds = useSelector(state => state.project.activeDatasetsIds);
  const datasets = useSelector(state => state.project.datasets);
  const project = useSelector(state => state.project.project);
  const user = useSelector(state => state.user);

  const [useServerRequests] = useServerRequestsHook();
  const [useSpots] = useSpotsHook();
  const [useImages] = useImagesHook();
  const [useProject] = useProjectHook();
  // Upload Project Properties

  const uploadDataset = async (dataset) => {
    try {
      console.log(dataset.name + ': Uploading Dataset Properties...');
      dispatch(addedStatusMessage({statusMessage: '----------'}));
      dispatch(addedStatusMessage({statusMessage: dataset.name + ': Uploading Dataset Properties...'}));

      let datasetCopy = JSON.parse(JSON.stringify(dataset));
      delete datasetCopy.spotIds;

      await useServerRequests.updateDataset(datasetCopy, user.encoded_login);
      await useServerRequests.addDatasetToProject(project.id, dataset.id, user.encoded_login);
      console.log(dataset.name + ': Finished Uploading Dataset Properties...');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: dataset.name + ': Finished Uploading Dataset Properties.'}));
    }
    catch (err) {
      console.error(dataset.name + ': Error Uploading Dataset Properties...');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: dataset.name + ': Error Uploading Dataset Properties.'}));
      throw Error;
    }

    await uploadSpots(dataset);
  };

  // Synchronously Upload Datasets
  const uploadDatasets = async () => {
    let currentRequest = 0;
    const activeDatasets = activeDatasetsIds.map(datasetId => datasets[datasetId]);

    const makeNextDatasetRequest = async () => {
      await uploadDataset(activeDatasets[currentRequest]);
      currentRequest++;
      if (currentRequest < activeDatasets.length) await makeNextDatasetRequest();
      else {
        const msgText = 'Finished Uploading ' + activeDatasets.length + ' Dataset' + (activeDatasets.length === 1 ? '.' : 's.');
        console.log(msgText);
        dispatch(addedStatusMessage({statusMessage: '----------'}));
        dispatch(addedStatusMessage({statusMessage: msgText}));
      }
    };

    if (activeDatasets.length === 0) {
      console.log('No Active Datasets Found.');
      dispatch(addedStatusMessage({statusMessage: 'No Active Datasets Found.'}));
    }
    else if (currentRequest < activeDatasets.length) {
      const msgText = 'Found ' + activeDatasets.length + ' Active Dataset' + (activeDatasets.length ? '' : 's') + ' to Upload.';
      console.log(msgText);
      dispatch(addedStatusMessage({statusMessage: msgText}));
      await makeNextDatasetRequest();
    }
  };

  const uploadProject = async () => {
    try {
      console.log('Uploading Project Properties...');
      dispatch(addedStatusMessage({statusMessage: 'Uploading Project Properties...'}));
      await useServerRequests.updateProject(project, user.encoded_login);
      console.log('Finished Uploading Project Properties...');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Finished Uploading Project Properties.'}));
    }
    catch (err) {
      console.error('Error Uploading Project Properties.', err);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Error Uploading Project Properties.'}));
      throw Error;
    }
  };

  // Upload Spots
  const uploadSpots = async (dataset) => {
    let spots;
    if (dataset.spotIds) {
      spots = await useSpots.getSpotsByIds(dataset.spotIds);
      spots.forEach(spotValue => useProject.checkValidDateTime(spotValue));
    }
    if (isEmpty(spots)) {
      console.log(dataset.name + ': No Spots to Upload.');
      dispatch(addedStatusMessage({statusMessage: dataset.name + ': No Spots to Upload.'}));
    }
    else {
      try {
        const spotCollection = {
          type: 'FeatureCollection',
          features: Object.values(spots),
        };
        console.log(dataset.name + ': Uploading Spots...');
        dispatch(addedStatusMessage({statusMessage: dataset.name + ': Uploading Spots...'}));
        await useServerRequests.updateDatasetSpots(dataset.id, spotCollection, user.encoded_login);
        console.log(dataset.name + ': Finished Uploading Spots.');
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: dataset.name + ': Finished Uploading Spots.'}));
        await uploadImages(Object.values(spots), dataset.name);
      }
      catch (err) {
        console.error(dataset.name + ': Error Uploading Project Spots.', err);
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: dataset.name + ': Error Uploading Spots.'}));
        throw Error;
      }
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
    dispatch(addedStatusMessage({statusMessage: datasetName + ': Looking for Images to Upload...'}));

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
          dispatch(addedStatusMessage({statusMessage: msgText}));
        }
        else {
          const msgText = datasetName + ': Found ' + imagesToUpload.length + ' Image'
            + (imagesToUpload.length === 1 ? '' : 's') + ' to Upload.';
          console.log(msgText, imagesToUpload);
          dispatch(removedLastStatusMessage());
          dispatch(addedStatusMessage({statusMessage: msgText}));
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
        const resizedImage = await resizeImageForUpload(imageProps, imageURI);
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
      dispatch(addedStatusMessage({statusMessage: msgText + '\n' + countMsgText}));
      if (imagesUploadedCount + imagesUploadFailedCount < imagesToUpload.length) {
        await startUploadingImage(imagesToUpload[imagesUploadedCount + imagesUploadFailedCount]);
      }
      else {
        msgText = datasetName + ': Finished Uploading Images' + (imagesUploadFailedCount > 0 ? ' with Errors' : '') + '.';
        console.log(msgText + '\n' + countMsgText);
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: msgText + '\n' + countMsgText}));
      }
    };

    // Get the URI of the image file if it exists on local device
    const getImageFile = async (imageProps) => {
      try {
        const imageURI = useImages.getLocalImageURI(imageProps.id);
        const isValidImageURI = await RNFS.exists(imageURI);
        if (isValidImageURI) return imageURI;
        throw Error;  // Webstorm giving warning here but we want this caught locally so we get the log
      }
      catch {
        console.log('Local file not found for image:' + imageProps.id);
        throw Error;
      }
    };

    // Downsize image for upload
    const resizeImageForUpload = async (imageProps, imageURI) => {
      try {
        console.log(datasetName + ': Resizing Image', imageProps.id, '...');
        let height = imageProps.height;
        let width = imageProps.width;

        if (!width || !height) ({width, height} = await useImages.getImageHeightAndWidth(imageURI));

        if (width && height) {
          const max_size = 2000;
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
          console.log(datasetName + ': Finished Resizing Image', imageProps.id, 'New Size', imageSizeText);
          return resizedImage;
        }
      }
      catch (err) {
        console.error(datasetName + ': Error Resizing Image.', err);
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
        if (dirExists) await RNFetchBlob.fs.unlink(tempImagesDownsizedDirectory);
      }
      catch {
        console.error(datasetName + ': Error Deleting Temp Images Folder.');
      }
    };

    if (spots.length > 0) await makeNextSpotRequest(spots[0]);
    if (imagesToUpload.length > 0) await startUploadingImage(imagesToUpload[0]);
    await deleteTempImagesFolder();
  };

  return {
    uploadDatasets: uploadDatasets,
    uploadProject: uploadProject,
  };
};

export default useUpload;
