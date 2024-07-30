import ImageResizer from 'react-native-image-resizer';
import {useDispatch, useSelector} from 'react-redux';

import {updatedProjectTransferProgress} from './connections.slice';
import {APP_DIRECTORIES} from './directories.constants';
import useDeviceHook from './useDevice';
import useServerRequestsHook from './useServerRequests';
import {addedStatusMessage, clearedStatusMessages, removedLastStatusMessage} from '../modules/home/home.slice';
import useImagesHook from '../modules/images/useImages';
import {setIsImageTransferring} from '../modules/project/projects.slice';

const useUploadImages = () => {
  const tempImagesDownsizedDirectory = APP_DIRECTORIES.APP_DIR + '/TempImages';

  const useDevice = useDeviceHook();
  const useImages = useImagesHook();
  const useServerRequests = useServerRequestsHook();

  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  // Downsize image for upload
  const resizeImageForUpload = async (imageProps, imageURI) => {
    try {
      console.log('Resizing Image', imageProps?.id, '...');
      let height = imageProps?.height;
      let width = imageProps?.width;

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

        await useDevice.makeDirectory(tempImagesDownsizedDirectory);
        const createResizedImageProps = [imageURI, width, height, 'JPEG', 100, 0, tempImagesDownsizedDirectory];
        const resizedImage = await ImageResizer.createResizedImage(...createResizedImageProps);
        useImages.getImageSize(imageProps, resizedImage);
        return resizedImage;
      }
    }
    catch (err) {
      console.error('Error Resizing Image.', err);
      throw Error;
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
        const resizedImage = await resizeImageForUpload(imageProps, imageURI);
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
        dispatch(removedLastStatusMessage());
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
        const isValidImageURI = await useDevice.doesDeviceDirExist(imageURI);
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
        // dispatch(setIsImageTransferring(false));
        throw Error;
      }
    };

    // Delete the folder used for downsized images
    const deleteTempImagesFolder = async () => {
      try {
        let dirExists = await useDevice.doesDeviceDirExist(tempImagesDownsizedDirectory);
        if (dirExists) await useDevice.deleteFromDevice(tempImagesDownsizedDirectory);
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


  return {
    uploadImages,
  };
};

export default useUploadImages;
