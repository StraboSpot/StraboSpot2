import { Alert, Image, Platform } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { useDispatch, useSelector } from 'react-redux';

import { APP_DIRECTORIES } from '../../services/device.constants';
import { getNewId } from '../../shared/Helpers';
import { setLoadingStatus } from '../home/home.slice';
import useHomeHook from '../home/useHome';
import { setCurrentImageBasemap } from '../maps/maps.slice';
import {
  editedSpotImage,
  editedSpotImages,
  editedSpotProperties,
  setSelectedAttributes,
  setSelectedSpot,
} from '../spots/spots.slice';

const useImages = () => {
  // const testUrl = 'https://strabospot.org/testimages/images.json';
  // const missingImage = require('../../assets/images/noimage.jpg');

  const navigation = useNavigation();

  const [useHome] = useHomeHook();

  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spot.spots);

  let imageCount = 0;
  let newImages = [];

  const deleteImage = async (imageId, spotWithImage) => {
    const spotsOnImage = Object.values(spots).filter(spot => spot.properties.image_basemap === imageId);
    if (spotsOnImage && spotsOnImage.length >= 1) {
      Alert.alert('Image Basemap contains Spots!', 'Delete the spots, before trying to delete the image');
      return false;
    }
    else if (spotWithImage) {
      const imagesDataCopy = spotWithImage.properties.images;
      const allOtherImages = imagesDataCopy.filter(item => imageId !== item.id);
      dispatch(setSelectedSpot(spotWithImage));
      dispatch(editedSpotProperties({ field: 'images', value: allOtherImages }));
      const localImageFile = getLocalImageURI(imageId);
      const fileExists = await RNFS.exists(localImageFile);
      if (fileExists) await RNFS.unlink(localImageFile);
      if (currentImageBasemap && currentImageBasemap.id === imageId) dispatch(setCurrentImageBasemap(undefined));
      return true;
    }
  };

  // Check to see if image is on the local device
  const doesImageExistOnDevice = async (imageId) => {
    try {
      const imageURI = getLocalImageURI(imageId);
      console.log('Looking on device for image at URI:', imageURI, '...');
      return await RNFS.exists(imageURI);
    }
    catch (err) {
      console.error('Error Checking if Image Exists on Device.');
    }
  };

  const editImage = (image) => {
    dispatch(setSelectedAttributes([image]));
    navigation.navigate('ImageInfo', { imageId: image.id });
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
          dispatch(editedSpotImages(newImages));
        }
        else Alert.alert('No Photos To Save', 'Please try again...');
        useHome.toggleLoading(false);
        return newImages.length;
      }
      else {
        console.log('Photos to Save:', [...newImages, photoProperties]);
        newImages.push(photoProperties);
        return launchCameraFromNotebook();
      }
    }
    catch (e) {
      Alert.alert('Error Getting Photo!', 'Please try again...');
      useHome.toggleLoading(false);
    }
  };

  const getAllImagesIds = (spotsArray) => {
    let imageIds = [];
    spotsArray.filter(spot => {
      if (spot.properties.images) spot.properties.images.map(image => imageIds.push(image.id));
    });
    return imageIds;
  };

  const gatherNeededImages = async (spotsOnServer, dataset) => {
    try {
      let neededImagesIds = [];
      let imageIds;
      console.log('Gathering Needed Images...');
      // dispatch(addedStatusMessage('Gathering Needed Images...'));
      if (dataset?.images?.neededImagesIds) {
        imageIds = dataset.images.neededImagesIds;
      }
      else imageIds = await getAllImagesIds(spotsOnServer);
      await Promise.all(
        imageIds.map(async (imageId) => {
          const doesExist = await doesImageExistOnDevice(imageId);
          if (!doesExist) {
            console.log('Need to download image:', imageId);
            neededImagesIds.push(imageId);
          }
          else console.log('Image', imageId, 'already exists on device. Not downloading.');
        }),
      );
      if (neededImagesIds.length > 0) {
        console.log('Images Needed to Download: ' + neededImagesIds.length, '/', imageIds.length);
        // dispatch(removedLastStatusMessage());
        // dispatch(addedStatusMessage('Images Needed to Download: ' + neededImagesIds.length));
      }
      console.log('Promised Finished');
      return { neededImagesIds: neededImagesIds, imageIds: imageIds };
    }
    catch (err) {
      console.error('Error Gathering Images.');
    }
  };

  const getLocalImageURI = (id) => {
    const imageURI = APP_DIRECTORIES.IMAGES + id + '.jpg';
    return Platform.OS === 'ios' ? imageURI : 'file://' + imageURI;
  };

  const getImagesFromCameraRoll = async () => {
    return new Promise((res, rej) => {
      try {
        const selectionLimitNumber = Platform.OS === 'ios' ? 10 : 0;
        dispatch(setLoadingStatus({ view: 'home', bool: true }));
        launchImageLibrary({selectionLimit: selectionLimitNumber}, async response => {
          console.log('RES', response);
          if (response.didCancel) dispatch(setLoadingStatus({ view: 'home', bool: false }));
          else if (response.errorCode === 'others') {
            console.error(response.errorMessage('Error Here'));
            dispatch(setLoadingStatus({ view: 'home', bool: false }));
          }
          else {
            let imageAsset = response.assets;
            await Promise.all(
              imageAsset.map(async image => {
                imageCount++;
                const resizedImage = await resizeImageIfNecessary(image);
                const savedPhoto = await saveFile(resizedImage);
                console.log('Saved Photo in getImagesFromCameraRoll:', savedPhoto);
                dispatch(editedSpotImages([savedPhoto]));
              }),
            );
            res(imageCount);
            dispatch(setLoadingStatus({ view: 'home', bool: false }));
          }
        });
      }
      catch (err) {
        console.error('Error saving image');
        dispatch(setLoadingStatus({ view: 'home', bool: false }));
        rej('Error saving image.');
      }
    });
  };

  const getImageHeightAndWidth = (imageURI) => {
    return new Promise((resolve, reject) => {
      Image.getSize(imageURI, (width, height) => {
        resolve({ height: height, width: width });
      }, (err) => {
        console.log('Error getting size of image:', err.message);
        reject();
      });
    });
  };

  const getImageThumbnailURIs = async (spotsWithImages) => {
    try {
      let imageThumbnailURIs = {};
      await Promise.all(spotsWithImages.map(async (spot) => {
        await Promise.all(spot.properties.images.map(async (image) => {
          const imageUri = getLocalImageURI(image.id);
          const exists = await RNFS.exists(imageUri);
          if (exists) {
            const createResizedImageProps = [imageUri, 200, 200, 'JPEG', 100, 0];
            const resizedImage = await ImageResizer.createResizedImage(...createResizedImageProps);
            imageThumbnailURIs = { ...imageThumbnailURIs, [image.id]: resizedImage.uri };
          }
          else {
            imageThumbnailURIs = { ...imageThumbnailURIs, [image.id]: undefined };
          }
        }));
      }));
      return imageThumbnailURIs;
    }
    catch (err) {
      console.error('Error creating thumbnails', err);
      // throw Error(err);
    }
  };

  const resizeImageIfNecessary = async (imageData) => {
    let height = imageData.height;
    let width = imageData.width;
    const tempImageURI = Platform.OS === 'ios' ? imageData.uri || imageData.path : imageData.uri || 'file://' + imageData.path;
    if (!height || !width) ({ height, width } = await getImageHeightAndWidth(tempImageURI));
    let resizedImage, createResizedImageProps = {};
    createResizedImageProps = (height > 4096 || width > 4096) ? [tempImageURI, 4096, 4096, 'JPEG', 100, 0]
      : [tempImageURI, width, height, 'JPEG', 100, 0];
    resizedImage = await ImageResizer.createResizedImage(...createResizedImageProps);
    return resizedImage;
  };

  const saveFile = async (imageData) => {
    console.log('New image data:', imageData);
    let height = imageData.height;
    let width = imageData.width;
    const tempImageURI = Platform.OS === 'ios' ? imageData.uri || imageData.path : imageData.uri || 'file://' + imageData.path;
    if (!height || !width) ({ height, width } = await getImageHeightAndWidth(tempImageURI));
    let imageId = getNewId();
    let imageURI = getLocalImageURI(imageId);
    try {
      await RNFS.mkdir(APP_DIRECTORIES.IMAGES);
      await RNFS.copyFile(tempImageURI, imageURI);
      console.log(imageCount, 'File saved to:', imageURI);
      // imageCount++;
      return {
        id: imageId,
        height: height,
        width: width,
      };
    }
    catch (err) {
      imageCount++;
      console.log('Error on', imageId, ':', err);
      dispatch(setLoadingStatus({ view: 'home', bool: false }));
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
      dispatch(editedSpotProperties({ field: 'images', value: updatedImages }));
    }
    if (!imageCopy.annotated) dispatch(setCurrentImageBasemap(undefined));
  };

  const setImageHeightAndWidth = async (image) => {
    const imageURI = getLocalImageURI(image.id);
    if (imageURI) {
      const isValidImageURI = await RNFS.exists(imageURI);
      if (isValidImageURI) {
        const imageSize = await getImageHeightAndWidth(imageURI);
        const updatedImage = { ...image, ...imageSize };
        dispatch(editedSpotImage(updatedImage));
        if (currentImageBasemap.id === updatedImage.id) {
          dispatch(setCurrentImageBasemap(updatedImage));
        }
      }
    }
    else console.error('Error setting image height and width');
  };

  // Called from Notebook Panel Footer and opens camera only
  const takePicture = async () => {
    return new Promise((resolve, reject) => {
      try {
        launchCamera({ saveToPhotos: true }, async (response) => {
          console.log('Response = ', response);
          if (response.didCancel) resolve('cancelled');
          else if (response.error) reject();
          else {
            const imageAsset = response.assets[0];
            const createResizedImageProps = [imageAsset.uri, imageAsset.height, imageAsset.width, 'JPEG', 100, 0];
            const resizedImage = await ImageResizer.createResizedImage(...createResizedImageProps);
            console.log('resizedImage', resizedImage);
            resolve(saveFile(resizedImage));
          }
        });
      }
      catch (e) {
        reject();
      }
    });
  };

  return [{
    deleteImage: deleteImage,
    doesImageExistOnDevice: doesImageExistOnDevice,
    editImage: editImage,
    gatherNeededImages: gatherNeededImages,
    getLocalImageURI: getLocalImageURI,
    getImagesFromCameraRoll: getImagesFromCameraRoll,
    getImageHeightAndWidth: getImageHeightAndWidth,
    getImageThumbnailURIs: getImageThumbnailURIs,
    launchCameraFromNotebook: launchCameraFromNotebook,
    saveFile: saveFile,
    setAnnotation: setAnnotation,
    setImageHeightAndWidth: setImageHeightAndWidth,
    takePicture: takePicture,
  }];
};

export default useImages;
