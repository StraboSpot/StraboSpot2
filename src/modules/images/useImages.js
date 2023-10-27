import {Dimensions, Image, PermissionsAndroid, Platform} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import {useToast} from 'react-native-toast-notifications';
import {batch, useDispatch, useSelector} from 'react-redux';

import {APP_DIRECTORIES} from '../../services/directories.constants';
import {STRABO_APIS} from '../../services/urls.constants';
import useDeviceHook from '../../services/useDevice';
import {getNewId} from '../../shared/Helpers';
import {
  addedStatusMessage,
  clearedStatusMessages,
  setErrorMessagesModalVisible,
  setLoadingStatus,
} from '../home/home.slice';
import {setCurrentImageBasemap} from '../maps/maps.slice';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {
  editedSpotImage,
  editedSpotImages,
  editedSpotProperties,
  setSelectedAttributes,
  setSelectedSpot,
} from '../spots/spots.slice';


const useImages = () => {
  const navigation = useNavigation();
  const toast = useToast();
  const useDevice = useDeviceHook();
  // const [useSpots] = useSpotsHook();


  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector(state => state.spot.spots);

  let imageCount = 0;
  let newImages = [];

  const deleteImage = async (imageId, spotWithImage) => {
    const spotsOnImage = Object.values(spots).filter(spot => spot.properties.image_basemap === imageId);
    if (spotsOnImage && spotsOnImage.length >= 1) {
      batch(() => {
        dispatch(clearedStatusMessages());
        dispatch(
          addedStatusMessage('Image Basemap contains Spots! \n\nDelete the spots, before trying to delete the image'));
        dispatch(setErrorMessagesModalVisible(true));
      });
      return false;
    }
    else if (spotWithImage) {
      const imagesDataCopy = spotWithImage.properties.images;
      const allOtherImages = imagesDataCopy.filter(item => imageId !== item.id);
      dispatch(setSelectedSpot(spotWithImage));
      dispatch(updatedModifiedTimestampsBySpotsIds([selectedSpot.properties.id]));
      dispatch(editedSpotProperties({field: 'images', value: allOtherImages}));
      const localImageFile = getLocalImageURI(imageId);
      const fileExists = await useDevice.doesDeviceDirExist(localImageFile);
      if (fileExists) await useDevice.deleteFromDevice(localImageFile);
      if (currentImageBasemap && currentImageBasemap.id === imageId) dispatch(setCurrentImageBasemap(undefined));
      return true;
    }
    else {
      batch(() => {
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage(`There was an error deleting image ${imageId}`));
        dispatch(setErrorMessagesModalVisible(true));
      });
    }
  };

  // Check to see if image is on the local device
  const doesImageExistOnDevice = async (imageId) => {
    try {
      const imageURI = getLocalImageURI(imageId);
      console.log('Looking on device for image at URI:', imageURI, '...');
      // console.log(`Image ${imageURI} Exists exists: ${exists}!!`);
      return await useDevice.doesDeviceDirExist(imageURI);
    }
    catch (err) {
      console.error('Error Checking if Image Exists on Device.');
    }
  };

  const editImage = (image) => {
    dispatch(setSelectedAttributes([image]));
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
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      if (savedPhoto === 'cancelled') {
        if (newImages.length > 0) {
          console.log('ALL PHOTOS SAVED', newImages);
          dispatch(updatedModifiedTimestampsBySpotsIds([selectedSpot.properties.id]));
          dispatch(editedSpotImages(newImages));
        }
        else toast.show('No Photos Saved', {duration: 2000, type: 'warning'});
        dispatch(setLoadingStatus({view: 'home', bool: false}));
        return newImages.length;
      }
      else {
        console.log('Photos to Save:', [...newImages, photoProperties]);
        newImages.push(photoProperties);
        return launchCameraFromNotebook();
      }
    }
    catch (err) {
      console.error(`Error Taking picture ${err}`);
      batch(() => {
        dispatch(clearedStatusMessages());
        dispatch(addedStatusMessage(`There was an error getting image:\n${err}`));
        dispatch(setErrorMessagesModalVisible(true));
        dispatch(setLoadingStatus({view: 'home', bool: false}));
      });
    }
  };

  const getAllImagesIds = (spotsArray) => {
    let imageIds = [];
    spotsArray.filter((spot) => {
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
      if (dataset?.images?.imageIds) {
        imageIds = dataset.images.imageIds;
      }
      else imageIds = getAllImagesIds(spotsOnServer);
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
      console.log('Promised Finished');
      return {neededImagesIds: neededImagesIds, imageIds: imageIds};
    }
    catch (err) {
      console.error('Error Gathering Images.', err);
    }
  };

  const getLocalImageURI = (id) => {
    if (Platform.OS === 'web') return STRABO_APIS.PUBLIC_IMAGE + id;
    else return 'file://' + APP_DIRECTORIES.IMAGES + id + '.jpg';
  };

  const saveImageFromDownloadsDir = async (image) => {
    const exists = await useDevice.doesDeviceDirExist(APP_DIRECTORIES.IMAGES);
    console.log('EXISTS', exists);
    const source = image.fileCopyUri;
    const dest = APP_DIRECTORIES.IMAGES + image.name;
    console.log('source:', source, 'dest', dest);
    await useDevice.moveFile(source, dest);
    const imagesInDir = await useDevice.readDirectory(APP_DIRECTORIES.IMAGES);
    console.log('images in app directory', imagesInDir);
    // return imageRes;
  };

  const getImagesFromCameraRoll = async () => {
    return new Promise((res, rej) => {
      try {
        const selectionLimitNumber = Platform.OS === 'ios' ? 10 : 0;
        launchImageLibrary({selectionLimit: selectionLimitNumber}, async (response) => {
          console.log('RES', response);
          if (response.didCancel) dispatch(setLoadingStatus({view: 'home', bool: false}));
          else if (response.errorCode === 'others') {
            console.error(response.errorMessage('Error Here'));
            dispatch(setLoadingStatus({view: 'home', bool: false}));
          }
          else {
            let imageAsset = response.assets;
            await Promise.all(
              imageAsset.map(async (image) => {
                imageCount++;
                const resizedImage = await resizeImageIfNecessary(image);
                const savedPhoto = await saveFile(resizedImage);
                console.log('Saved Photo in getImagesFromCameraRoll:', savedPhoto);
                dispatch(updatedModifiedTimestampsBySpotsIds([selectedSpot.properties.id]));
                dispatch(editedSpotImages([savedPhoto]));
              }),
            );
            res(imageCount);
          }
        });
      }
      catch (err) {
        console.error('Error saving image');
        dispatch(setLoadingStatus({view: 'home', bool: false}));
        rej('Error saving image.');
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

  const getImageThumbnailURI = (id) => {
    return STRABO_APIS.PUBLIC_IMAGE_THUMBNAIL + id;
  };

  const getImageScreenSizedURI = (id) => {
    const {width, height} = Dimensions.get('window');
    return STRABO_APIS.PUBLIC_IMAGE_RESIZED + Math.max(width, height) + '/' + id;
  };

  const getImageThumbnailURIs = async (spotsWithImages) => {
    try {
      let imageThumbnailURIs = {};
      await Promise.all(spotsWithImages.map(async (spot) => {
        await Promise.all(spot.properties.images.map(async (image) => {
          if (Platform.OS === 'web') {
            imageThumbnailURIs = {...imageThumbnailURIs, [image.id]: getImageThumbnailURI(image.id)};
          }
          else {
            const imageUri = getLocalImageURI(image.id);
            const exists = await useDevice.doesDeviceDirExist(imageUri);
            if (exists) {
              const createResizedImageProps = [imageUri, 200, 200, 'JPEG', 100, 0];
              const resizedImage = await ImageResizer.createResizedImage(...createResizedImageProps);
              imageThumbnailURIs = {...imageThumbnailURIs, [image.id]: resizedImage.uri};
            }
            else imageThumbnailURIs = {...imageThumbnailURIs, [image.id]: undefined};
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
    if (!height || !width) ({height, width} = await getImageHeightAndWidth(tempImageURI));
    let resizedImage, createResizedImageProps;
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
    if (!height || !width) ({height, width} = await getImageHeightAndWidth(tempImageURI));
    let imageId = getNewId();
    let imageURI = getLocalImageURI(imageId);
    try {
      const exists = await useDevice.doesDeviceDirExist(APP_DIRECTORIES.IMAGES);
      if (!exists) await useDevice.makeDirectory(APP_DIRECTORIES.IMAGES);
      await useDevice.copyFiles(tempImageURI, APP_DIRECTORIES.IMAGES + imageId + '.jpg');
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
      dispatch(setLoadingStatus({view: 'home', bool: false}));
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
      dispatch(updatedModifiedTimestampsBySpotsIds([selectedSpot.properties.id]));
      dispatch(editedSpotProperties({field: 'images', value: updatedImages}));
    }
    if (!imageCopy.annotated) dispatch(setCurrentImageBasemap(undefined));
  };

  const setImageHeightAndWidth = async (image) => {
    const imageURI = getLocalImageURI(image.id);
    if (imageURI) {
      const isValidImageURI = await useDevice.doesDeviceDirExist(imageURI);
      if (isValidImageURI) {
        const imageSize = await getImageHeightAndWidth(imageURI);
        const updatedImage = {...image, ...imageSize};
        const spot = dispatch(editedSpotImage(updatedImage));
        console.log(spot);
        if (currentImageBasemap.id === updatedImage.id) {
          dispatch(setCurrentImageBasemap(updatedImage));
        }
      }
    }
    else console.error('Error setting image height and width');
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'StraboSpot needs access to your camera '
            + 'so you can take pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      }
      else {
        console.log('Camera permission denied');
      }
    }
    catch (err) {
      console.warn(err);
    }
  };

  // Called from Notebook Panel Footer and opens camera only
  const takePicture = async () => {
    console.log(PermissionsAndroid.PERMISSIONS.CAMERA);
    return new Promise((resolve, reject) => {
      try {
        launchCamera({saveToPhotos: true}, async (response) => {
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
        dispatch(setLoadingStatus({view: 'home', bool: false}));
        reject(e);
      }
    });
  };

  return [{
    deleteImage: deleteImage,
    doesImageExistOnDevice: doesImageExistOnDevice,
    editImage: editImage,
    gatherNeededImages: gatherNeededImages,
    getLocalImageURI: getLocalImageURI,
    saveImageFromDownloadsDir: saveImageFromDownloadsDir,
    getImagesFromCameraRoll: getImagesFromCameraRoll,
    getImageHeightAndWidth: getImageHeightAndWidth,
    getImageScreenSizedURI: getImageScreenSizedURI,
    getImageThumbnailURI: getImageThumbnailURI,
    getImageThumbnailURIs: getImageThumbnailURIs,
    launchCameraFromNotebook: launchCameraFromNotebook,
    requestCameraPermission: requestCameraPermission,
    saveFile: saveFile,
    setAnnotation: setAnnotation,
    setImageHeightAndWidth: setImageHeightAndWidth,
    takePicture: takePicture,
  }];
};

export default useImages;
