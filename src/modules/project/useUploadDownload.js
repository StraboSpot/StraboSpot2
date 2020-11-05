import {Platform} from 'react-native';

import {useDispatch} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import {isEmpty} from '../../shared/Helpers';
import {addedStatusMessage, removedLastStatusMessage} from '../home/home.slice';
import {useImagesHook} from '../images';
import useImportExportHook from './useImportExport';


const useUploadDownload = () => {
  let imagesDownloadedCount = 0;
  let imagesFailedCount = 0;
  let savedImagesCount = 0;
  let imagesFailedArr = [];
  let imageCount = 0;
  let newImages = [];

  const dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectory = '/StraboSpot';
  const imagesDirectory = devicePath + appDirectory + '/Images';
  const tempImagesDownsizedDirectory = devicePath + appDirectory + '/TempImages';
  // const testUrl = 'https://strabospot.org/testimages/images.json';
  // const missingImage = require('../../assets/images/noimage.jpg');

  const dispatch = useDispatch();

  const useImportExport = useImportExportHook();

  const downloadAndSaveImagesToDevice = async (imageId) => {
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
            imagesFailedArr.push(imageId);
          });
        }
        else {
          imageCount++;
          console.log(imageCount, 'File saved to', res.path());
        }
      })
      .catch((errorMessage, statusCode) => {
        imageCount++;
        console.error('Error on', imageId, ':', errorMessage, statusCode);  // Android Error: RNFetchBlob request error: url == nullnull
        throw Error('Response is 404!');
      });
  };

  const initializeDownloadImages = async (neededImageIds) => {
    try {
      console.log('Downloading Needed Images...');
      dispatch(addedStatusMessage({statusMessage: 'Downloading Needed Images...'}));
      if (!isEmpty(neededImageIds)) {
        // Check path first, if doesn't exist, then create
        await useImportExport.doesDeviceDirectoryExist(devicePath + appDirectory + imagesDirectory);
        await Promise.all(
          neededImageIds.map(async imageId => {
            await downloadAndSaveImagesToDevice(imageId);
            imagesDownloadedCount++;
            savedImagesCount++;
            console.log(
              'NEW/MODIFIED Images Downloaded: ' + imagesDownloadedCount + ' of ' + neededImageIds.length
              + ' NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImageIds.length);
            dispatch(removedLastStatusMessage());
            dispatch(addedStatusMessage({
              statusMessage: 'NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImageIds.length,
            }));
          }),
        );
        console.log('Downloaded Images ' + imageCount + '/' + neededImageIds.length
          + '\nFailed Images ' + imagesFailedCount + '/' + neededImageIds.length);
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
      }
    }
    catch (err) {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage({statusMessage: 'Error Downloading Images!'}));
      console.warn('Error Downloading Images: ' + err);
    }
  };

  return {
    initializeDownloadImages: initializeDownloadImages,
  };
};

export default useUploadDownload;
