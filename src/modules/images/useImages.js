import {Alert, Image, Platform} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Base64} from 'js-base64';
// import ImagePicker from 'react-native-image-crop-picker';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import useServerRequests from '../../services/useServerRequests';
import {getNewId, isEmpty} from '../../shared/Helpers';
import {homeReducers} from '../home/home.constants';
import useHomeHook from '../home/useHome';
import {mapReducers} from '../maps/maps.constants';
import useExportHook from '../project/useExport';
import {spotReducers} from '../spots/spot.constants';

const RNFS = require('react-native-fs');

const useImages = () => {
  const navigation = useNavigation();
  let missingImage = require('../../assets/images/noimage.jpg');

  // let imageFiles = [];
  let imageArr = [];
  let imageCount = 0;
  let dirs = RNFetchBlob.fs.dirs;
  // const url = 'https://strabospot.org/testimages/images.json';
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectory = '/StraboSpot';
  const imagesDirectory = devicePath + appDirectory + '/Images';
  const tempImagesDownsizedDirectory = devicePath + appDirectory + '/TempImages';

  const [useHome] = useHomeHook();
  const [serverRequests] = useServerRequests();
  const [useExport] = useExportHook();

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const deleteTempImagesFolder = async () => {
    return await RNFetchBlob.fs.unlink(tempImagesDownsizedDirectory);
  };

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

  // const formatBytes = (a,b) => {
  //   if (a === 0) return '0 Bytes';
  //   const c = 1024;
  //   const d = b || 2;
  //   const sizes = ['Bytes','KB','MB','GB','TB','PB','EB','ZB','YB'];
  //   const i = Math.floor(Math.log(a) / Math.log(c));
  //
  //   return parseFloat((a / Math.pow(c,i)).toFixed(d)) + ' ' + sizes[i];
  // };

  // Checks to see if image is already on device
  const doesImageExist = async (imageId) => {
    const imageURI = getLocalImageSrc(imageId);
    console.log('Looking on device for image URI:', imageURI, '...');
    const isValidURI = RNFS.exists(imageURI);
    console.log(`${isValidURI ? '' : 'Not '}Found file URI: ${imageURI}`);
    return Promise.resolve(isValidURI);
    /*  return RNFetchBlob.fs.exists(imageURI).then(exist => {
     console.log(`${exist ? '' : 'Not '}Found file URI: ${imageURI}`);
     return exist ? imageURI : undefined;
     // return exist
     },
     )
     .catch((err) => {
     throw err;
     });*/
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
        src: savedPhoto.src,
        image_type: 'photo',
        height: savedPhoto.height,
        width: savedPhoto.width,
      };
      useHome.toggleLoading(true);
      if (savedPhoto === 'cancelled') {
        if (imageArr.length > 0) {
          console.log('ALL PHOTOS SAVED', imageArr);
          dispatch({type: spotReducers.EDIT_SPOT_IMAGES, images: imageArr});
          // props.onSpotEditImageObj(imageArr);
          useHome.toggleLoading(false);
          // toggleToast();
          return Promise.resolve(imageArr.length);
        }
        else {
          useHome.toggleLoading(false);
          Alert.alert('No Photos To Save', 'please try again...');
        }
      }
      else {
        // setAllPhotosSaved(oldArray => ([...oldArray, photoProperties]));
        imageArr.push(photoProperties);
        console.log('Photos Saved:', imageArr);
        return launchCameraFromNotebook();
      }
    }
    catch (e) {
      Alert.alert('Error Getting Photo!');
      useHome.toggleLoading(false);
    }
  };

  // const launchCameraFromNotebook = () => {
  //   // try {
  //     return takePicture().then((savedPhoto) => {
  //       const photoProperties = {
  //         id: savedPhoto.id,
  //         src: savedPhoto.src,
  //         image_type: 'photo',
  //         height: savedPhoto.height,
  //         width: savedPhoto.width,
  //       };
  //       useHome.toggleLoading(true);
  //       if (savedPhoto === 'cancelled') {
  //         if (imageArr.length > 0) {
  //           console.log('ALL PHOTOS SAVED', imageArr);
  //           dispatch({type: spotReducers.EDIT_SPOT_IMAGES, images: imageArr});
  //           // props.onSpotEditImageObj(imageArr);
  //           useHome.toggleLoading(false);
  //           // toggleToast();
  //           return Promise.resolve(imageArr.length);
  //         }
  //         else {
  //           useHome.toggleLoading(false);
  //           Alert.alert('No Photos To Save', 'please try again...');
  //         }
  //       }
  //       else {
  //         // setAllPhotosSaved(oldArray => ([...oldArray, photoProperties]));
  //         imageArr.push(photoProperties);
  //         console.log('Photos Saved:', imageArr);
  //         return launchCameraFromNotebook();
  //       }
  //     })
  //   // }
  //   // catch (e) {
  //   //   Alert.alert('Error Getting Photo!');
  //   //   useHome.toggleLoading(false);
  //   // }
  // };

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

  /*const getImageFileURIById = (imageId) => {
    return doesImageExist(imageId).then((fileURI) => {
      if (fileURI) {
        console.log('Found image file:', fileURI);
        return Promise.resolve(fileURI);
      }
      else {
        console.log('File not found');
        //return Promise.resolve(missingImage);
        return Promise.reject('img/image-not-found.png');
      }
    });
  };*/

  const getLocalImageSrc = (id) => {
    const imageURI = imagesDirectory + '/' + id + '.jpg';
    return Platform.OS === 'ios' ? imageURI : 'file://' + imageURI;
  };

  const getLocalImageSrc2 = id => {
    const imageSrc = imagesDirectory + '/' + id + '.jpg';
    // console.count('Image Number');
    // console.log('Loading image from', Platform.OS === 'ios' ? imageSrc : 'file://' + imageSrc);
    return Platform.OS === 'ios' ? imageSrc : 'file://' + imageSrc;
  };

  const getPlatformImageSrc = (imageSrc) => {
    let imagePath = imageSrc.replace('file://', '');
    if (Platform.OS === 'android') imagePath = 'file://' + imagePath;
    //imagePath = Platform.OS === 'ios' ? imagePath : 'file//' + imagePath;
    //   return RNFS.exists(imagePath);
    //  const doesExist = await RNFS.exists(imagePath);
    // console.log('doesExist', doesExist, missingImage);
    //  return Promise.resolve(doesExist ? {uri: imagePath} : undefined);
    //   if (!doesExist) {
    //    console.log('Image does not exist on device for', imageSrc);
    //     imagePath = missingImage;
    //   }
    return imagePath;
    //return {uri: imagePath};
    //return [{uri: imagePath}, missingImage];
    // return missingImage;
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

  // Called from Image Gallery and displays image source picker
  const pictureSelectDialog = async () => {
    const imageOptionsPicker = {
      storageOptions: {
        skipBackup: true,
      },
      title: 'Choose Photo Source',
    };
    return new Promise((resolve, reject) => {
      ImagePicker.showImagePicker(imageOptionsPicker, async (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
          resolve('cancelled');
        }
        else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
          return reject('Error', response.error);
        }
        else {
          try {
            const savedPhoto = await saveFile(response);
            console.log('Saved Photo = ', savedPhoto);
            resolve(savedPhoto);
          }
          catch (e) {
            reject();
          }
        }
      });
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

  const saveFile = async (imageData) => {
    let height = imageData.height;
    let width = imageData.width;
    console.log('New image data:', imageData);
    if (!height || !width)  [height, width] = await getImageHeightAndWidth(imageData.path);
    //if (!imageData.height || !imageData.width) {
      //const imageURI = await getPlatformImageSrc(imageData.path);
      //[height, width] = await getImageHeightAndWidth(imageURI);
    //}
    let imageId = getNewId();
    const imagePath = imagesDirectory + '/' + imageId + '.jpg';
    console.log(imageData);
    try {
      await RNFS.mkdir(imagesDirectory);
      if (imageData.uri) await RNFS.copyFile(imageData.uri, imagePath);
      else await RNFS.copyFile(imageData, imagePath);
      console.log(imageCount, 'File saved to:', imagePath);
      imageCount++;
      const imageDataToSave = {
        id: imageId,
        src: Platform.OS === 'ios' ? imagePath : imageData.uri,
        height: height,
        width: width,
      };
      return Promise.resolve(imageDataToSave);
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
      const updatedImages = selectedSpot.properties.images.filter(image => imageCopy.id !== image.id);
      console.log(updatedImages);
      updatedImages.push(imageCopy);
      dispatch({type: spotReducers.EDIT_SPOT_PROPERTIES, field: 'images', value: updatedImages});
    }
    if (!imageCopy.annotated) {
      dispatch({type: mapReducers.CURRENT_IMAGE_BASEMAP, currentImageBasemap: undefined});
    }
  };

  // Should be setImageSize
  const setImageBasemapSize = async (imageBasemap) => {
    const imageURI = getLocalImageSrc(imageBasemap.id);
    if (imageURI) {
      const isValidImageURI = await RNFS.exists(imageURI);
      if (isValidImageURI) {
        const imageSize = await getImageHeightAndWidth(imageURI);
        const updatedImage = {...imageBasemap, ...imageSize};
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
    // console.log('aassaasswwww')
    return new Promise((resolve, reject) => {
      ImagePicker.launchCamera(imageOptionsCamera, async (response) => {
        console.log('Response = ', response);
        if (response.didCancel) {
          console.log('User cancelled image picker');
          resolve('cancelled');
        }
        else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        }
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

      dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Gathering Images to Upload...'});
      console.log('Gathering images to upload from Spots:', spots);

      const areMoreImages = (spot) => {
        return spot.properties && spot.properties.images && iImagesLoop < spot.properties.images.length;
      };

      const areMoreSpots = () => {
        return iSpotLoop + 1 < spots.length;
      };

      const getImageFile = async imageProps => {
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Processing Image...'});
        const imageURI = getLocalImageSrc(imageProps.id);
        const isValidImageURI = await RNFS.exists(imageURI);
        if (isValidImageURI) return Promise.resolve([imageProps, imageURI]);
        else return Promise.reject('Local file not found for image:', imageProps.id);

        // const src = await getImageFileURIById(imageProps.id);
        // if (src !== 'img/image-not-found.png') {
        //   return Promise.resolve([imageProps, src]);
        // }
        // else return Promise.reject('Local file not found for image:', imageProps.id);
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
            dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
            dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'No NEW images to upload'});
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
        return serverRequests.verifyImageExistence(imageProps.id, user.encoded_login)
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

      const resizeImageForUpload = async (imageFile, imageProps) => {
        const max_size = 2000;
        let height = imageProps.height;
        let width = imageProps.width;

        //const imageURI = getPlatformImageSrc(imageFile);
       // if (!width || !height) [width, height] = await getImageHeightAndWidth(imageURI);

        const imageURI = getLocalImageSrc(imageProps.id);
        if (!width || !height) [width, height] = await getImageHeightAndWidth(imageURI);

        if (width && height) {
          if (width > height && width > max_size) {
            height = max_size * height / width;
            width = max_size;
          }
          else if (height > max_size) {
            width = max_size * width / height;
            height = max_size;
          }

          let dirExists = await RNFS.exists(tempImagesDownsizedDirectory);
          console.log(tempImagesDownsizedDirectory, 'exists?', dirExists ? 'YES' : 'NO');
          if (!dirExists) await RNFS.mkdir(tempImagesDownsizedDirectory);

          dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
          dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Downsizing Image for Upload...'});
          console.log('Resizing image', imageProps.id, '...');

          return ImageResizer.createResizedImage(
            imageFile,
            width,
            height,
            'JPEG',
            100,
            0,
            tempImagesDownsizedDirectory + 'sdfsdf',
          )
            .then(response => {
              response.name = imageProps.id.toString();
              if (response.size < 1024) console.log('Resized image:', response.size, 'bytes');
              else if (response.size < 1048576) {
                console.log('Resized image:', (response.size / 1024).toFixed(3), ' kB');
              }
              else if (response.size < 1073741824) {
                console.log('Resized image:', (response.size / 1048576).toFixed(2), ' MB');
              }
              else console.log('Resized image:', (response.size / 1073741824).toFixed(3), ' GB');
              return response;
            })
            .catch((err) => {
              console.error('Error Resizing Image', err);
              Alert.alert('Error Resizing Image', err);
            });
        }
        return Promise.reject();
      };

      const uploadImage = async ([imageProps, src]) => {
        const count = imagesUploadedCount + 1;

        const resizedImage = await resizeImageForUpload(src, imageProps);
        if (resizedImage) {
          const uploadURI = Platform.OS === 'ios' ? resizedImage.path.replace('file//', '') : resizedImage.path;

          dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
          dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Uploading Image: ' + count});
          console.log('Uploading image', imageProps.id, 'to server...');

          let formdata = new FormData();
          formdata.append('image_file', {uri: uploadURI, name: 'image.jpg', type: 'image/jpeg'});
          formdata.append('id', imageProps.id);
          formdata.append('modified_timestamp', Date.now());
          return serverRequests.uploadImage(formdata, user.encoded_login)
            .then((res) => {
                imagesUploadedCount++;
                console.log('Finished uploading image', imageProps.id, 'to the server');
                console.log('Uploaded Images:' + imagesUploadedCount);
                dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
                dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Uploaded Images:', imagesUploadedCount});
                return Promise.resolve();
              },
              (err) => Promise.reject('Error uploading image' + imageProps.id) + '\n' + err)
            .catch((err) => {
              console.error('Error Uploading Image', err);
              Alert.alert('Error Uploading Image', err);
            });
        }
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
    getLocalImageSrc: getLocalImageSrc,
    //getImageFileURIById: getImageFileURIById,
    getImagesFromCameraRoll: getImagesFromCameraRoll,
    launchCameraFromNotebook: launchCameraFromNotebook,
    pictureSelectDialog: pictureSelectDialog,
    saveFile: saveFile,
    setAnnotation: setAnnotation,
    setImageBasemapSize: setImageBasemapSize,
    takePicture: takePicture,
    uploadImages: uploadImages,
  }];
};

export default useImages;
