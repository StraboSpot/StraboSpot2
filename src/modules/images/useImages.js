import {useState} from 'react';
import {Alert, Image, Platform} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import useServerRequestsHook from '../../services/useServerRequests';
import {getNewId, isEmpty} from '../../shared/Helpers';
import {
  addedStatusMessage,
  removedLastStatusMessage,
  setLoadingStatus,
} from '../home/home.slice';
import useHomeHook from '../home/useHome';
import {mapReducers} from '../maps/maps.constants';
import useExportHook from '../project/useExport';
import {spotReducers} from '../spots/spot.constants';
import {editedSpotImage, editedSpotImages, editedSpotProperties, setSelectedAttributes} from '../spots/spotSliceTemp';

const RNFS = require('react-native-fs');

const useImages = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const user = useSelector(state => state.user);

  const [newImages, setNewImages] = useState([]);

  const [useExport] = useExportHook();
  const [useHome] = useHomeHook();
  const [useServerRequests] = useServerRequestsHook();

  const dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectory = '/StraboSpot';
  const imagesResizeTemp = '/TempImages';
  const imagesDirectory = devicePath + appDirectory + '/Images';
  let imageCount = 0;

  const deleteTempImagesFolder = async () => {
    return await RNFetchBlob.fs.unlink(devicePath + imagesResizeTemp);
  };

  const downloadImages = async (neededImageIds) => {
    let promises = [];
    let imagesDownloadedCount = 0;
    let imagesFailedCount = 0;
    let savedImagesCount = 0;
    let imagesFailedArr = [];
    dispatch(addedStatusMessage({statusMessage: 'Downloading Images...'}));

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
            dispatch(removedLastStatusMessage());
            if (imagesFailedCount > 0) {
              dispatch(addedStatusMessage(
                {
                  statusMessage: 'Downloaded Images ' + imageCount + '/' + neededImageIds.length
                    + '\nFailed Images ' + imagesFailedCount + '/' + neededImageIds.length,
                }));
            }
            else {
              dispatch(addedStatusMessage(
                {statusMessage: 'Downloaded Images: ' + imageCount + '/' + neededImageIds.length},
              ));
            }
          });
          promises.push(promise);
        }
      }
    }
    catch (e) {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Error Downloading Images!'}));
      console.warn('Error Downloading Images: ' + e);
    }

    return Promise.all(promises).then(() => {
      if (imagesFailedCount > 0) {
        //downloadErrors = true;
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: 'Image Downloads Failed: \' + imagesFailedCount'}));
        console.warn('Image Downloads Failed: ' + imagesFailedCount);
      }
      else {
        dispatch(setLoadingStatus({bool: false}));
      }
    });
  };

  // const formatBytes = (a,b) => {
  //   if (a === 0) return '0 Bytes';
  //   const c = 1024;
  //   const d = b || 2;
  //   const sizes = ['Bytes','KB','MB','GB','TB','PB','EB','ZB','YB'];
  //   const i = Math.floor(Math.log(a) / Math.log(c));
  //
  //   return parseFloat((a / Math.pow(c,i)).toFixed(d)) + ' ' + sizes[i];
  // };

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
    // dispatch({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: [image]});
    dispatch(setSelectedAttributes([image]));
    navigation.navigate('ImageInfo', {imageId: image.id});
  };

  const launchCameraFromNotebook = async () => {
    try {
      const savedPhoto = await takePicture();
      const photoProperties = {
        id: savedPhoto.id,
        src: savedPhoto.src,
        image_type: 'photo',
        height: savedPhoto.height,
        width: savedPhoto.width,
      };
      useHome.toggleLoading(true);
      if (savedPhoto === 'cancelled') {
        if (newImages.length > 0) {
          console.log('ALL PHOTOS SAVED', newImages);
          // dispatch({type: spotReducers.EDIT_SPOT_IMAGES, images: newImages});
          dispatch(editedSpotImages(newImages));
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
        setNewImages(prevState => [...prevState, photoProperties]);
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

  const getLocalImageSrc = id => {
    const imageSrc = imagesDirectory + '/' + id + '.jpg';
    // console.count('Image Number');
    // console.log('Loading image from', Platform.OS === 'ios' ? imageSrc : 'file://' + imageSrc);
    return Platform.OS === 'ios' ? imageSrc : 'file://' + imageSrc;
  };

  const getImagesFromCameraRoll = async () => {
    ImagePicker.launchImageLibrary({}, async response => {
      console.log('RES', response);
      if (response.didCancel) useHome.toggleLoading(false);
      else {
        useHome.toggleLoading(true);
        const savedPhoto = await saveFile(response);
        console.log('Saved Photo in getImagesFromCameraRoll:', savedPhoto);
        // dispatch({type: spotReducers.EDIT_SPOT_IMAGES, images: [savedPhoto]});
        dispatch(editedSpotImages([savedPhoto]));
        useHome.toggleLoading(false);
      }
    });
  };

  const getImageHeightAndWidth = async (imageURI) => {
    return new Promise((resolve, reject) => {
      Image.getSize(imageURI.uri || imageURI, (width, height) => {
        resolve({height: height, width: width});
      }, (error) => {
        Alert.alert('Error getting size of image:', error.message);
        reject('Error getting size of image:' + error);
      });
    });
  };

  const saveFile = async (imageURI) => {
    let imageSize;
    if (!imageURI.height || !imageURI.width) imageSize = await getImageHeightAndWidth(imageURI);
    let imageId = getNewId();
    const imagePath = imagesDirectory + '/' + imageId + '.jpg';
    console.log(imageURI);
    try {
      await RNFS.mkdir(imagesDirectory);
      if (imageURI.uri) await RNFS.copyFile(imageURI.uri, imagePath);
      else await RNFS.copyFile(imageURI, imagePath);
      console.log(imageCount, 'File saved to:', imagePath);
      imageCount++;
      let imageData = {};
      if (Platform.OS === 'ios') {
        imageData = {
          id: imageId,
          src: imagePath,
          height: imageURI.height || imageSize.height,
          width: imageURI.width || imageSize.width,
        };
      }
      else imageData = {id: imageId, src: imageURI.uri, height: imageURI.height, width: imageURI.width};
      return Promise.resolve(imageData);
    }
    catch (e) {
      imageCount++;
      console.log('Error on', imageId, ':', e);
      return Promise.reject();
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
      dispatch(editedSpotProperties({field: 'images', value: updatedImages}));
    }
    if (!imageCopy.annotated) dispatch({type: mapReducers.CURRENT_IMAGE_BASEMAP, currentImageBasemap: undefined});
  };

  const setImageHeightAndWidth = async (imageBasemap) => {
    const imageURI = getLocalImageURI(imageBasemap.id);
    if (imageURI) {
      const isValidImageURI = await RNFS.exists(imageURI);
      if (isValidImageURI) {
        const imageSize = await getImageHeightAndWidth(imageURI);
        const updatedImage = {...imageBasemap, ...imageSize};
        dispatch(editedSpotImage(updatedImage));
        // dispatch({type: spotReducers.EDIT_SPOT_IMAGE, image: updatedImage});
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
      ImagePicker.launchCamera(imageOptionsCamera, async (response) => {
        console.log('Response = ', response);
        if (response.didCancel) {
          console.log('User cancelled image picker');
          resolve('cancelled');
        }
        else if (response.error) console.log('ImagePicker Error: ', response.error);
        else {
          try {
            const savedPhoto = await saveFile(response);
            console.log('Saved Photo = ', savedPhoto);
            // Deletes default path after every photo saved to /StraboSpot/Images.
            RNFS.unlink(response.uri).then(() => {
              console.log('Image default path is unlinked:');
              resolve(savedPhoto);
            })
              .catch(err => console.log('Image unlink error:', err.message));
          }
          catch (e) {
            reject();
          }
        }
      });
    });
  };

  const uploadImages = spots => {
    return new Promise((resolve, reject) => {
      spots = Object.values(spots);
      let imagesToUploadCount = 0;
      let imagesUploadedCount = 0;
      let imagesUploadFailedCount = 0;
      let iSpotLoop = 0;
      let iImagesLoop = 0;

      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Gathering Images to Upload...'}));
      console.log('Gathering images to upload from Spots:', spots);

      const areMoreImages = (spot) => {
        return spot.properties && spot.properties.images && iImagesLoop < spot.properties.images.length;
      };

      const areMoreSpots = () => {
        return iSpotLoop + 1 < spots.length;
      };

      const getImageFile = async imageProps => {
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: 'Processing Image...'}));
        const imageURI = getLocalImageURI(imageProps.id);
        const isValidImageURI = await RNFS.exists(imageURI);
        if (isValidImageURI) return Promise.resolve([imageProps, imageURI]);
        else return Promise.reject('Local file not found for image:', imageProps.id);
      };

      const makeNextSpotRequest = (spot) => {
        if (areMoreImages(spot)) {
          console.log('Found image:', spot.properties.images[iImagesLoop].id, spot.properties.images[iImagesLoop],
            'in Spot:', spot.properties.name);
          makeNextImageRequest(spot.properties.images[iImagesLoop]).then(() => {
            console.log('Making Next spot request');
            makeNextSpotRequest(spots[iSpotLoop]);
          });
        }
        else if (areMoreSpots()) {
          iSpotLoop++;
          iImagesLoop = 0;
          makeNextSpotRequest(spots[iSpotLoop]);
        }
        else {
          if (imagesToUploadCount === 0) {
            console.log('No NEW images to upload');
            dispatch(removedLastStatusMessage());
            dispatch(addedStatusMessage({statusMessage: 'No NEW images to upload'}));
          }
          else {
            console.log('Finished Uploading Images');
            if (imagesUploadFailedCount > 0) Alert.alert(`'Images Failed:' ${imagesUploadFailedCount}`);
          }
          resolve();
        }
      };

      const makeNextImageRequest = (imageProps) => {
        return shouldUploadImage(imageProps)
          .then(getImageFile)
          .then(uploadImage)
          .catch(function (err) {
            if (err !== 'already exists') {
              imagesUploadFailedCount++;
              console.warn(err);
            }
          })
          .finally(function () {
            iImagesLoop++;
            return Promise.resolve();
          });
      };

      const shouldUploadImage = async (imageProps) => {
        return useServerRequests.verifyImageExistence(imageProps.id, user.encoded_login)
          .then(response => {
            if (response
              && ((response.modified_timestamp && imageProps.modified_timestamp
                && imageProps.modified_timestamp > response.modified_timestamp)
                || (!response.modified_timestamp && imageProps.modified_timestamp))) {
              console.log('Need to upload image:', imageProps.id, 'Server response:', response);
              imagesToUploadCount++;
              return Promise.resolve(imageProps);
            }
            else {
              console.log('No need to upload image:', imageProps.id, 'Server response:', response);
              return Promise.reject('already exists');
            }
          }, () => {
            imagesToUploadCount++;
            console.log('Need to upload image:', imageProps.id);
            return Promise.resolve(imageProps);
          });
      };

      const resizeImageForUpload = (imageFile, imageProps) => {
        const max_size = 2000;
        let height = imageProps.height;
        let width = imageProps.width;

        if (width > height && width > max_size) {
          height = max_size * height / width;
          width = max_size;
        }
        else if (height > max_size) {
          width = max_size * width / height;
          height = max_size;
        }
        return ImageResizer.createResizedImage(
          imageFile,
          width,
          height,
          'JPEG',
          100,
          0,
          devicePath + imagesResizeTemp,
        )
          .then(response => {
            response.name = imageProps.id.toString();
            if (response.size < 1024) console.log(response.size + ' Bytes');
            else if (response.size < 1048576) {
              console.log('Resize Image KB:' + (response.size / 1024).toFixed(3) + ' KB');
            }
            else if (response.size < 1073741824) {
              console.log('Resize Image MB:' + (response.size / 1048576).toFixed(2) + ' MB');
            }
            else console.log('Resize Image' + (response.size / 1073741824).toFixed(3) + ' GB');
            return response;
          })
          .catch((err) => {
            Alert.alert('Image Resize Error', err);
          });
      };

      const uploadImage = async (data) => {
        const imageProps = data[0];
        const src = data[1];
        const count = imagesUploadedCount + 1;
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage({statusMessage: 'Uploading image: ' + count}));
        console.log('Uploading image', imageProps.id, 'to server...');

        const resizeImage = await resizeImageForUpload(src, imageProps);
        const uploadURI = Platform.OS === 'ios' ? resizeImage.path.replace('file//', '') : resizeImage.path;
        // console.log('Image re-sized obj', resizeImage);

        let formdata = new FormData();
        formdata.append('image_file', {uri: uploadURI, name: 'image.jpg', type: 'image/jpeg'});
        formdata.append('id', imageProps.id);
        formdata.append('modified_timestamp', Date.now());
        const bytes = await getImageHeightAndWidth(resizeImage.path);
        if (bytes < 1024) console.log(bytes + ' Bytes');
        else if (bytes < 1048576) console.log('KB:' + (bytes / 1024).toFixed(3) + ' KB');
        else if (bytes < 1073741824) console.log('MB:' + (bytes / 1048576).toFixed(2) + ' MB');
        else console.log((bytes / 1073741824).toFixed(3) + ' GB');
        // console.time();
        return useServerRequests.uploadImage(formdata, user.encoded_login)
          .then((res) => {
              // console.timeEnd();
              imagesUploadedCount++;
              console.log('Image Uploaded!' + imagesUploadedCount);
              console.log('Finished uploading image', imageProps.id, 'to the server');
              dispatch(removedLastStatusMessage());
              dispatch(addedStatusMessage({statusMessage: 'Uploaded Images', imagesUploadedCount}));
              return Promise.resolve();
            },
            (err) => Promise.reject('Error uploading image' + imageProps.id) + '\n' + err)
          .catch((err) => {
            console.error('Image Upload Error', err);
            Alert.alert('Image Upload Error', err);
          });
      };

      if (iSpotLoop < spots.length) makeNextSpotRequest(spots[iSpotLoop]);
      else resolve();
    });
  };

  return [{
    deleteTempImagesFolder: deleteTempImagesFolder,
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
