import ImageResizer from 'react-native-image-resizer';
import {useDispatch, useSelector} from 'react-redux';

import {updatedProjectTransferProgress} from './connections.slice';
import {APP_DIRECTORIES} from './directories.constants';
import useDeviceHook from './useDevice';
import useServerRequestsHook from './useServerRequests';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage, setIsProgressModalVisible,
} from '../modules/home/home.slice';
import useImagesHook from '../modules/images/useImages';
import {setIsImageTransferring} from '../modules/project/projects.slice';
import {isEmpty} from '../shared/Helpers';

const useUploadImages = () => {
  const imagesFound = [];
  const imagesNotFoundOnDevice = [];
  const tempImagesDownsizedDirectory = APP_DIRECTORIES.APP_DIR + '/TempImages';

  const useDevice = useDeviceHook();
  const useImages = useImagesHook();
  const useServerRequests = useServerRequestsHook();

  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const spots = useSelector(state => state.spot.spots);

  // Gather all the images in spots and returns the ids.
  const getImageIds = async () => {

    Object.values(spots).forEach(spot => spot?.properties?.images?.map(image => imagesFound.push(image)));
    console.log('SPOT IMAGES', imagesFound);
    const imageIdsArray = imagesFound.map((image) => {
      return image.id;
    });
    console.log(imageIdsArray);
    return imageIdsArray;
  };

  // Get the URI of the image file if it exists on local device
  const getImageFile = async (imageId) => {
    const imageURI = useImages.getLocalImageURI(imageId);
    const isValidImageURI = await useDevice.doesDeviceDirExist(imageURI);
    if (isValidImageURI) return imageURI;
    else {
      console.log('Local file not found for image:' + imageId);
      imagesNotFoundOnDevice.push(imageId);
    }
  };

  const initializeImageUpload = async () => {
    console.log('Looking for Images to Upload in Spots...', spots);
    dispatch(addedStatusMessage('Looking for images to upload in spots...'));
    const spotImageIds = await getImageIds();
    dispatch(removedLastStatusMessage());
    dispatch(addedStatusMessage('Checking to see if image files are on server...'));
    const neededImages = await useServerRequests.verifyImagesExistence(spotImageIds, user.encoded_login);
    dispatch(removedLastStatusMessage());
    dispatch(addedStatusMessage(`Checking to see if ${neededImages.length} image files are on device...`));
    // console.log('Done getting spot images', spotImages);
    const verifiedImagesToUpload = await verifyImageExistsOnDevice(neededImages);
    // console.log('Done verifying images on device', verifiedImages);

    if (!isEmpty(verifiedImagesToUpload)) {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Uploading needed images to server...'));
      uploadImages(verifiedImagesToUpload).then(() => {
        console.log('DONE UPLOADING IMAGES');
        dispatch(removedLastStatusMessage());
        dispatch(addedStatusMessage(`Uploaded ${verifiedImagesToUpload.length} to server.`));
      });
    }
    else {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(`All  ${verifiedImagesToUpload.length} images on device are already on server`));
      dispatch(setIsProgressModalVisible(false));
    }
  };

  // Downsize image for upload
  const resizeImageForUpload = async (imageProps) => {
    try {
      console.log('Resizing Image', imageProps?.id, '...');
      let height = imageProps?.height;
      let width = imageProps?.width;

      if (!width || !height) ({width, height} = await useImages.getImageHeightAndWidth(imageProps.uri));

      if (width > 2000 || height > 2000) {
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
        const createResizedImageProps = [imageProps.uri, width, height, 'JPEG', 100, 0, tempImagesDownsizedDirectory];
        const resizedImage = await ImageResizer.createResizedImage(...createResizedImageProps);
        useImages.getImageSize(imageProps, resizedImage);
        return resizedImage;
      }
      else return imageProps;
    }
    catch (err) {
      console.error('Error Resizing Image.', err);
      // throw Error;
    }
  };

  const verifyImageExistsOnDevice = async (neededImageIds) => {
    const imagesToUpload = [];
    await Promise.all((
      neededImageIds.map(async (imageId) => {
          console.log(imageId);
          const imageURI = useImages.getLocalImageURI(imageId);
          if (imageURI) {
            const imagePath = await getImageFile(imageId);
            if (imagePath) {
              console.log(`Image ${imageId} EXISTS`);
              imagesFound.find((image) => {
                if (image.id.toString() === imageId) {
                  const imageWithPath = {...image, uri: imageURI};
                  imagesToUpload.push(imageWithPath);
                }
              });
            }
          }
          else {
            console.log(`Image ${imageId} DOES NOT EXISTS`);
          }
        },
      )));
    return imagesToUpload;
  };

  // Upload the image to server
  const uploadImage = async (imageId, imageUri) => {
    try {
      console.log(': Uploading Image', imageId, '...');
      dispatch(setIsImageTransferring(true));

      let formdata = new FormData();
      formdata.append('image_file', {uri: imageUri, name: 'image.jpg', type: 'image/jpeg'});
      formdata.append('id', imageId);
      formdata.append('modified_timestamp', Date.now());
      const res = await useServerRequests.uploadImage(formdata, user.encoded_login);
      console.log('Image Upload Res', res);
      console.log(': Finished Uploading Image', imageId);
      dispatch(updatedProjectTransferProgress(0));
      dispatch(clearedStatusMessages());
      await useDevice.deleteFromDevice(imageUri);
      // dispatch(setIsImageTransferring(false));
    }
    catch (err) {
      console.log(': Error Uploading Image', imageId, err);
      // dispatch(setIsImageTransferring(false));
      throw Error(err);
    }
  };

  const uploadImages = async (imagesToUpload, datasetName) => {
    let imagesUploadedCount = 0;
    let imagesUploadFailedCount = 0;

    // Start uploading image by getting the image file, downsizing the image and then uploading
    const startUploadingImage = async (imageProps) => {
      try {
        // const imageURI = await getImageFile(imageProps.id);
        const resizedImage = await resizeImageForUpload(imageProps);
        await uploadImage(imageProps.id, resizedImage.uri);
        imagesUploadedCount++;
      }
      catch (err) {
        console.error(`Failed to upload image ${imageProps.id} because ${err.Error}`);
        imagesUploadFailedCount++;
      }
      let msgText = `Uploading Image ${imageProps.id}...`;
      console.log(`Success: ${imagesUploadedCount}/${imagesToUpload.length} uploaded.`);
      console.log(`Not on device: ${imagesNotFoundOnDevice.length}/${imagesToUpload.length} uploaded.`);
      console.log(`Fail: ${imagesUploadFailedCount}/${imagesToUpload.length} uploaded.`);
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage(
        `\n${msgText} 
         \nSuccess: ${imagesUploadedCount}/${imagesToUpload.length} uploaded. 
         \nFailed: ${imagesUploadFailedCount || 0}/${imagesToUpload.length}`),
      );
      // if (imagesUploadFailedCount > 0) {
      //   failedCountMsgText = ' (' + imagesUploadFailedCount + ' Failed)';
      //   dispatch(removedLastStatusMessage());
      //   dispatch(addedStatusMessage(`\n ${failedCountMsgText}`));
      // }

      if (imagesUploadedCount + imagesUploadFailedCount < imagesToUpload.length) {
        await startUploadingImage(imagesToUpload[imagesUploadedCount + imagesUploadFailedCount]);
      }
      else {
        dispatch(clearedStatusMessages());
        if (imagesUploadFailedCount > 0) {
          dispatch(addedStatusMessage('Finished uploading images with Errors.\n'));
          dispatch(addedStatusMessage(`\n${imagesUploadFailedCount} Images failed to upload\n`));
        }
        else dispatch(addedStatusMessage(`Finished uploading ${imagesUploadedCount} images to server.`));
      }
    };

    if (imagesToUpload.length > 0) {
      dispatch(removedLastStatusMessage());
      dispatch(
        addedStatusMessage(`Uploading ${imagesToUpload.length} image${imagesToUpload.length <= 1 ? '' : 's'}.`),
      );
      await startUploadingImage(imagesToUpload[0]);
    }
    else dispatch(addedStatusMessage('\nNo images to upload'));
    await useDevice.deleteTempImagesFolder();
    dispatch(setIsProgressModalVisible(false));
  };

  const uploadProfileImage = async (imageURI) => {
    try {
      await uploadImage('profileImage', imageURI);
      console.log('Profile Image Uploaded');
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Profile Image Uploaded'));
    }
    catch (err) {
      console.error(`Failed to upload profile image because ${err.Error}`);
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Failed to upload profile image'));
      throw Error();
    }
  };

  return {
    initializeImageUpload: initializeImageUpload,
    resizeImageForUpload: resizeImageForUpload,
    verifyImageExistsOnDevice: verifyImageExistsOnDevice,
    uploadImages: uploadImages,
    uploadProfileImage: uploadProfileImage,
  };
};

export default useUploadImages;
