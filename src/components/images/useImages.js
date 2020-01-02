import React from 'react';
import {Alert, Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {useSelector} from 'react-redux';

// Hooks
import useServerRequests from '../../services/useServerRequests';

const useImages = () => {

  let imageCount = 0;
  let dirs = RNFetchBlob.fs.dirs;
  // const url = 'https://strabospot.org/testimages/images.json';
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectory = '/StraboSpot';
  const imagesDirectory = devicePath + appDirectory + '/Images';
  const [serverRequests] = useServerRequests();

  const user = useSelector(state => state.user);

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

  const downloadImages = neededImageIds => {
    let promises = [];
    let imagesDownloadedCount = 0;
    let imagesFailedCount = 0;
    let savedImagesCount = 0;

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
      Alert.alert(`Images needed to download: ${neededImagesIds.length}`);
      return Promise.resolve(neededImagesIds);
    });
  };

  const getLocalImageSrc = id => {
    const imageSrc = imagesDirectory + '/' + id + '.jpg';
    console.log('Loading image from', Platform.OS === 'ios' ? imageSrc : 'file://' + imageSrc);
    return Platform.OS === 'ios' ? imageSrc : 'file://' + imageSrc;
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
          makeNextImageRequest(spot.properties.images[iImagesLoop]).then((res) => {
            console.log('Exists', res);
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
            Alert.alert('No new images to upload');
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
        return await serverRequests.verifyImageExistence(imageProps.id, user.encoded_login)
          .then(response => {
            if (response
              && ((response.modified_timestamp && imageProps.modified_timestamp
                && imageProps.modified_timestamp > response.modified_timestamp)
                || (!response.modified_timestamp && imageProps.modified_timestamp))) {
              console.log('Need to upload image:', imageProps.id);
              imagesToUploadCount++;
              return Promise.resolve(imageProps);
            }
            else {
              console.log('No need to upload image:', imageProps.id, 'Server response:', response);
              return Promise.reject('already exists');
            }
          }, () => {
            console.log('Need to upload image:', imageProps.id);
            imagesToUploadCount++;
            return Promise.resolve(imageProps);
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
    uploadImages: uploadImages,
  }];
};

export default useImages;
