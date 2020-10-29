import {Alert, Image, Platform} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import useServerRequestsHook from '../../services/useServerRequests';
import {getNewId, isEmpty} from '../../shared/Helpers';
import {homeReducers} from '../home/home.constants';
import useHomeHook from '../home/useHome';
import {mapReducers} from '../maps/maps.constants';
import useExportHook from '../project/useExport';
import {spotReducers} from '../spots/spot.constants';

const RNFS = require('react-native-fs');

const useImages = () => {
  const dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectory = '/StraboSpot';
  const imagesDirectory = devicePath + appDirectory + '/Images';
  const tempImagesDownsizedDirectory = devicePath + appDirectory + '/TempImages';
  // const testUrl = 'https://strabospot.org/testimages/images.json';
  // const missingImage = require('../../assets/images/noimage.jpg');

  const navigation = useNavigation();

  const [useExport] = useExportHook();
  const [useHome] = useHomeHook();
  const [useServerRequests] = useServerRequestsHook();

  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const user = useSelector(state => state.user);

  let imageCount = 0;
  let newImages = [];

  const downloadImages = async (neededImageIds) => {
    let promises = [];
    let imagesDownloadedCount = 0;
    let imagesFailedCount = 0;
    let savedImagesCount = 0;
    let imagesFailedArr = [];
    dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Downloading Images...'});

    const downloadImageAndSave = async (imageId) => {
      const imageURI = 'https://strabospot.org/pi/' + imageId;
      return RNFetchBlob
        .config({path: imagesDirectory + '/' + imageId + '.jpg'})
        .fetch('GET', imageURI, {})
        .then((res) => {
          if (res.respInfo.status === 404) {
            imageCount++;
            imagesFailedCount++;
            console.log('Error on', imageId);  // Android Error: RNFetchBlob request error: url == nullnull
            return RNFetchBlob.fs.unlink(res.data).then(() => {
              console.log('Failed image removed', imageId);
              return Promise.reject('404 status');
            });
          }
          else {
            imageCount++;
            console.log(imageCount, 'File saved to', res.path());
            return Promise.resolve({imageIdMessage: 'Success with' + imageId});
          }
        })
        .catch((errorMessage, statusCode) => {
          imageCount++;
          console.error('Error on', imageId, ':', errorMessage, statusCode);  // Android Error: RNFetchBlob request error: url == nullnull
          return Promise.reject();
        });
    };

    try {
      if (!isEmpty(neededImageIds)) {
        // Check path first, if doesn't exist, then create
        await useExport.doesDeviceDirectoryExist(devicePath + appDirectory);
        await useExport.doesDeviceDirectoryExist(imagesDirectory);

        for (const imageId of neededImageIds) {
          let promise = await downloadImageAndSave(imageId).then(() => {
            imagesDownloadedCount++;
            savedImagesCount++;
            console.log(
              'NEW/MODIFIED Images Downloaded: ' + imagesDownloadedCount + ' of ' + neededImageIds.length
              + ' NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImageIds.length);
          }, err => {
            imagesFailedCount++;
            console.warn('Error downloading Image', imageId, 'Error:', err);
            RNFetchBlob.fs.unlink(imagesDirectory + '/' + imageId).then(() => {
              console.log('Image removed', imageId);
              imagesFailedArr.push(imageId);
            });
          }).finally(() => {
            dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
            if (imagesFailedCount > 0) {
              dispatch({
                type: homeReducers.ADD_STATUS_MESSAGE,
                statusMessage: 'Downloaded Images ' + imageCount + '/' + neededImageIds.length
                  + '\nFailed Images ' + imagesFailedCount + '/' + neededImageIds.length,
              });
            }
            else {
              dispatch({
                type: homeReducers.ADD_STATUS_MESSAGE,
                statusMessage: 'Downloaded Images: ' + imageCount + '/' + neededImageIds.length,
              });
            }
          });
          promises.push(promise);
        }
      }
    }
    catch (e) {
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Error Downloading Images!'});
      console.warn('Error Downloading Images: ' + e);
    }

    return Promise.all(promises).then(() => {
      if (imagesFailedCount > 0) {
        //downloadErrors = true;
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        dispatch(
          {type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Image Downloads Failed: ' + imagesFailedCount});
        console.warn('Image Downloads Failed: ' + imagesFailedCount);
      }
      else {
        dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
        // dispatch({type:  homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Download Complete!'});
      }
    });
  };

  // Check to see if image is on the local device
  const doesImageExist = async (imageId) => {
    const imageURI = getLocalImageURI(imageId);
    console.log('Looking on device for image at URI:', imageURI, '...');
    const isValidURI = await RNFS.exists(imageURI);
    if (isValidURI) console.log(`Found image at URI: ${imageURI}`);
    else console.error(`Not Found image at URI: ${imageURI}`);
    return Promise.resolve(isValidURI);
  };

  const editImage = (image) => {
    dispatch({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: [image]});
    navigation.navigate('ImageInfo', {imageId: image.id});
  };

  const launchCameraFromNotebook = async () => {
    try {
      const savedPhoto = await takePicture();
      const photoProperties = {
        id: savedPhoto.id,
        image_type: 'photo',
        height: savedPhoto.height,
        width: savedPhoto.width,
      };
      useHome.toggleLoading(true);
      if (savedPhoto === 'cancelled') {
        if (newImages.length > 0) {
          console.log('ALL PHOTOS SAVED', newImages);
          dispatch({type: spotReducers.EDIT_SPOT_IMAGES, images: newImages});
          useHome.toggleLoading(false);
          return Promise.resolve(newImages.length);
        }
        else {
          useHome.toggleLoading(false);
          Alert.alert('No Photos To Save', 'please try again...');
        }
      }
      else {
        console.log('Photos to Save:', [...newImages, photoProperties]);
        newImages.push(photoProperties);
        return launchCameraFromNotebook();
      }
    }
    catch (e) {
      Alert.alert('Error Getting Photo!');
      useHome.toggleLoading(false);
    }
  };

  const gatherNeededImages = async (spots) => {
    let neededImagesIds = [];
    const promises = [];

    spots.map(spot => {
      if (spot.properties.images) {
        spot.properties.images.map((image) => {
          const promise = doesImageExist(image.id).then((exists) => {
            if (!exists) {
              console.log('Need to download image:', image.id);
              neededImagesIds.push(image.id);
            }
            else console.log('Image', image.id, 'already exists on device. Not downloading.');
          });
          promises.push(promise);
        });
      }
    });
    return Promise.all(promises).then(() => {
      // Alert.alert(`Images needed to download: ${neededImagesIds.length}`);
      return Promise.resolve(neededImagesIds);
    });
  };

  const getLocalImageURI = (id) => {
    const imageURI = imagesDirectory + '/' + id + '.jpg';
    return Platform.OS === 'ios' ? imageURI : 'file://' + imageURI;
  };

  const getImagesFromCameraRoll = async () => {
    ImagePicker.launchImageLibrary({}, async response => {
      console.log('RES', response);
      if (response.didCancel) useHome.toggleLoading(false);
      else {
        useHome.toggleLoading(true);
        const savedPhoto = await saveFile(response);
        console.log('Saved Photo in getImagesFromCameraRoll:', savedPhoto);
        dispatch({type: spotReducers.EDIT_SPOT_IMAGES, images: [savedPhoto]});
        useHome.toggleLoading(false);
      }
    });
  };

  const getImageHeightAndWidth = (imageURI) => {
    return new Promise((resolve, reject) => {
      Image.getSize(imageURI, (width, height) => {
        resolve({height: height, width: width});
      }, (err) => {
        console.log('Error getting size of image:', err.message);
        reject();
      });
    });
  };

  const saveFile = async (imageData) => {
    console.log('New image data:', imageData);
    let height = imageData.height;
    let width = imageData.width;
    const tempImageURI = Platform.OS === 'ios' ? imageData.path : 'file://' + imageData.path;
    if (!height || !width) ({height, width} = await getImageHeightAndWidth(tempImageURI));
    let imageId = getNewId();
    let imageURI = getLocalImageURI(imageId);
    try {
      await RNFS.mkdir(imagesDirectory);
      await RNFS.copyFile(tempImageURI, imageURI);
      console.log(imageCount, 'File saved to:', imageURI);
      imageCount++;
      return {
        id: imageId,
        height: height,
        width: width,
      };
    }
    catch (err) {
      imageCount++;
      console.log('Error on', imageId, ':', err);
      throw Error;
    }
  };

  const setAnnotation = (image, annotation) => {
    const imageCopy = JSON.parse(JSON.stringify(image));
    imageCopy.annotated = annotation;
    if (annotation && !imageCopy.title) imageCopy.title = imageCopy.id;
    if (selectedSpot && selectedSpot.properties && selectedSpot.properties.images) {
      const updatedImages = selectedSpot.properties.images.filter(image2 => imageCopy.id !== image2.id);
      console.log(updatedImages);
      updatedImages.push(imageCopy);
      dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: 'images', value: updatedImages});
    }
    if (!imageCopy.annotated) dispatch({type: mapReducers.CURRENT_IMAGE_BASEMAP, currentImageBasemap: undefined});
  };

  const setImageHeightAndWidth = async (image) => {
    const imageURI = getLocalImageURI(image.id);
    if (imageURI) {
      const isValidImageURI = await RNFS.exists(imageURI);
      if (isValidImageURI) {
        const imageSize = await getImageHeightAndWidth(imageURI);
        const updatedImage = {...image, ...imageSize};
        dispatch({type: spotReducers.EDIT_SPOT_IMAGE, image: updatedImage});
        if (currentImageBasemap.id === updatedImage.id) {
          dispatch({type: mapReducers.CURRENT_IMAGE_BASEMAP, currentImageBasemap: updatedImage});
        }
      }
    }
    else console.error('Error setting image height and width');
  };

  // Called from Notebook Panel Footer and opens camera only
  const takePicture = async () => {
    const imageOptionsCamera = {
      storageOptions: {
        skipBackup: true,
        takePhotoButtonTitle: 'Take Photo',
        chooseFromLibraryButtonTitle: 'Choose Photo From Library',
        waitUntilSaved: true,
      },
      noData: true,
    };
    return new Promise((resolve, reject) => {
      try {
        ImagePicker.launchCamera(imageOptionsCamera, (response) => {
          console.log('Response = ', response);
          if (response.didCancel) resolve('cancelled');
          else if (response.error) reject();
          else resolve(saveFile(response));
        });
      }
      catch (e) {
        reject();
      }
    });
  };

  const uploadImages = async (spots, datasetName) => {
    let imagesOnServer = [];
    let imagesToUpload = [];
    let imagesUploadedCount = 0;
    let imagesUploadFailedCount = 0;
    let iSpotLoop = 0;
    let iImagesLoop = 0;

    console.log(datasetName + ': Looking for Images to Upload in Spots...', spots);
    dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: datasetName + ': Looking for Images to Upload...'});

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
          dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
          dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: msgText});
        }
        else {
          const msgText = datasetName + ': Found ' + imagesToUpload.length + ' Image'
            + (imagesToUpload.length === 1 ? '' : 's') + ' to Upload.';
          console.log(msgText, imagesToUpload);
          dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
          dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: msgText});
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
      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: msgText + '\n' + countMsgText});
      if (imagesUploadedCount + imagesUploadFailedCount < imagesToUpload.length) {
        await startUploadingImage(imagesToUpload[imagesUploadedCount + imagesUploadFailedCount]);
      }
      else {
        msgText = datasetName + ': Finished Uploading Images' + (imagesUploadFailedCount > 0 ? ' with Errors' : '') + '.';
        console.log(msgText + '\n' + countMsgText);
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: msgText + '\n' + countMsgText});
      }
    };

    // Get the URI of the image file if it exists on local device
    const getImageFile = async (imageProps) => {
      try {
        const imageURI = getLocalImageURI(imageProps.id);
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

        if (!width || !height) ({width, height} = await getImageHeightAndWidth(imageURI));

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

  return [{
    doesImageExist: doesImageExist,
    downloadImages: downloadImages,
    editImage: editImage,
    gatherNeededImages: gatherNeededImages,
    getLocalImageURI: getLocalImageURI,
    getImagesFromCameraRoll: getImagesFromCameraRoll,
    launchCameraFromNotebook: launchCameraFromNotebook,
    saveFile: saveFile,
    setAnnotation: setAnnotation,
    setImageHeightAndWidth: setImageHeightAndWidth,
    takePicture: takePicture,
    uploadImages: uploadImages,
  }];
};

export default useImages;
