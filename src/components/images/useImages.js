import React from 'react';
import {Alert, Platform} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import {useSelector, useDispatch} from 'react-redux';
import {getNewId} from '../../shared/Helpers';

// Hooks
import useServerRequests from '../../services/useServerRequests';
import {homeReducers} from '../../views/home/Home.constants';

const useImages = () => {

  let imageCount = 0;
  let dirs = RNFetchBlob.fs.dirs;
  // const url = 'https://strabospot.org/testimages/images.json';
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectory = '/StraboSpot';
  const imagesDirectory = devicePath + appDirectory + '/Images';
  const [serverRequests] = useServerRequests();

  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const downloadImages = neededImageIds => {
    let promises = [];
    let imagesDownloadedCount = 0;
    let imagesFailedCount = 0;
    let savedImagesCount = 0;
    dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Downloading Images...'});

    const downloadImageAndSave = async (imageId) => {
      const imageURI = 'https://strabospot.org/pi/' + imageId;
      return new Promise((resolve, reject) => {
        RNFetchBlob
          .config({path: imagesDirectory + '/' + imageId + '.jpg'})
          .fetch('GET', imageURI, {})
          .then((res) => {
            imageCount++;
            console.log(imageCount, 'File saved to', res.path());
            // let imageId = imageName.split('.')[0];
            let imageData = {};
            if (Platform.OS === 'ios') {
              imageData = {
                id: imageId,
                src: res.path(),
                height: imageURI.height,
                width: imageURI.width,
              };
            }
            else imageData = {id: imageId, src: 'file://' + res.path(), height: imageURI.height, width: imageURI.width};
            resolve(imageData);
          })
          .catch((errorMessage, statusCode) => {
            imageCount++;
            console.log('Error on', imageId, ':', errorMessage, statusCode);  // Android Error: RNFetchBlob request error: url == nullnull
            reject();
          });
      });
    };

    neededImageIds.map(imageId => {
      let promise = downloadImageAndSave(imageId).then(() => {
        imagesDownloadedCount++;
        savedImagesCount++;
        console.log(
          'NEW/MODIFIED Images Downloaded: ' + imagesDownloadedCount + ' of ' + neededImageIds.length +
          ' NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImageIds.length);
      }, err => {
        imagesFailedCount++;
        console.warn('Error downloading Image', imageId, 'Error:', err);
      }).finally( () => {
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        if (imagesFailedCount > 0) {
          dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Downloaded Images ' + imageCount + '/' + neededImageIds.length
          + 'Failed Images ' + imagesFailedCount + '/' + neededImageIds});
        }
        else dispatch({type:  homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Downloaded Images: ' + imageCount + '/' + neededImageIds.length});
      });
      promises.push(promise);
    });
    return Promise.all(promises).then(() => {
      if (imagesFailedCount > 0) {
        //downloadErrors = true;
        console.warn('Image Downloads Failed: ' + imagesFailedCount);
      }
    });
  };

  const gatherNeededImages = async (spots) => {
    let neededImagesIds = [];
    const promises = [];

    // Checks to see if image is already on device
    const doesImageExist = async (imageId) => {
      const filePath = imagesDirectory;
      const fileName = imageId.toString() + '.jpg';
      const fileURI = filePath + '/' + fileName;
      console.log('Looking on device for file URI: ', fileURI);
      return await RNFetchBlob.fs.exists(fileURI).then(exist => {
          console.log(`File URI ${fileURI} does ${exist ? '' : 'not'} exist on device`);
          return exist;
        },
      )
        .catch((err) => {
          throw err;
        });
    };

    spots.map(spot => {
      if (spot.properties.images) {
        spot.properties.images.map((image) => {
          const promise = doesImageExist(image.id).then((exists) => {
            if (!exists) {
              console.log('Need to download image', image.id);
              neededImagesIds.push(image.id);
            }
            else console.log('Image', image.id, 'already exists on device. Not downloading.');
          });
          promises.push(promise);
        });
      }
      else console.log('No images to download');
    });
    return Promise.all(promises).then(() => {
      // Alert.alert(`Images needed to download: ${neededImagesIds.length}`);
      return Promise.resolve(neededImagesIds);
    });
  };

  const getLocalImageSrc = id => {
    const imageSrc = imagesDirectory + '/' + id + '.jpg';
    console.log('Loading image from', Platform.OS === 'ios' ? imageSrc : 'file://' + imageSrc);
    return Platform.OS === 'ios' ? imageSrc : 'file://' + imageSrc;
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

  const saveFile = async (imageURI) => {
    let uriParts = imageURI.uri.split('/');
    // let imageName = uriParts[uriParts.length - 1];
    let imageId = getNewId();
    return new Promise((resolve, reject) => {
      RNFetchBlob
        .config({path: imagesDirectory + '/' + imageId + '.jpg'})
        .fetch('GET', imageURI.uri, {})
        .then((res) => {
          imageCount++;
          console.log(imageCount, 'File saved to', res.path());
          // let imageId = imageName.split('.')[0];
          let imageData = {};
          if (Platform.OS === 'ios') {
            imageData = {
              id: imageId,
              src: res.path(),
              height: imageURI.height,
              width: imageURI.width,
            };
          }
          else imageData = {id: imageId, src: 'file://' + res.path(), height: imageURI.height, width: imageURI.width};
          resolve(imageData);
        })
        .catch((errorMessage, statusCode) => {
          imageCount++;
          console.log('Error on', imageId, ':', errorMessage, statusCode);  // Android Error: RNFetchBlob request error: url == nullnull
          reject();
        });
    });
  };

  // Called from Notebook Panel Footer and opens camera only
  const takePicture = async () => {
    const imageOptionsCamera = {
      storageOptions: {
        skipBackup: true,
        takePhotoButtonTitle: 'Take Photo Buddy!',
        chooseFromLibraryButtonTitle: 'choose photo from library',
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
            resolve(savedPhoto);
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

      console.log('Gathering images to upload', spots);

      const areMoreImages = (spot) => {
        return spot.properties && spot.properties.images && iImagesLoop < spot.properties.images.length;
      };

      const areMoreSpots = () => {
        return iSpotLoop + 1 < spots.length;
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
            console.log('No new images to upload in spot:', spot.properties.name);
            resolve();
          }
          else {
            console.log('Finished Uploading Images');
            if (imagesUploadFailedCount > 0) {
              Alert.alert(`'Images Failed:' ${imagesUploadFailedCount}`);
            }
            resolve();
          }
        }
      };

      const makeNextImageRequest = (imageProps) => {
        console.log(imageProps);
        return shouldUploadImage(imageProps)
          // .then(getImageFile)
          // .then(convertImageFile)
          // .then(uploadImage)
          .catch(function (err) {
            if (err !== 'already exists') {
              // uploadErrors = true;
              imagesUploadFailedCount++;
              console.error(err);
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
              console.log('Need to upload image:', imageProps.id);
              imagesToUploadCount++;
              return resolve(imageProps);
            }
            else {
              console.log('No need to upload image:', imageProps.id, 'Server response:', response);
              return reject('already exists');
            }
          }, () => {
            imagesToUploadCount++;
            console.log('Need to upload image:', imageProps.id);
            imagesToUploadCount++;
            return resolve(imageProps);
          });
      };

      if (iSpotLoop < spots.length) makeNextSpotRequest(spots[iSpotLoop]);
      else resolve();
    });
  };

  return [{
    downloadImages: downloadImages,
    gatherNeededImages: gatherNeededImages,
    getLocalImageSrc: getLocalImageSrc,
    pictureSelectDialog: pictureSelectDialog,
    takePicture: takePicture,
    uploadImages: uploadImages,
  }];
};

export default useImages;
