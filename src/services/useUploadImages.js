import ImageResizer from 'react-native-image-resizer';
import {useDispatch, useSelector} from 'react-redux';

import {updatedProjectTransferProgress} from './connections.slice';
import {APP_DIRECTORIES} from './directories.constants';
import useDeviceHook from './useDevice';
import useServerRequestsHook from './useServerRequests';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setIsProgressModalVisible,
} from '../modules/home/home.slice';
import useImagesHook from '../modules/images/useImages';
import {setIsImageTransferring} from '../modules/project/projects.slice';
import {isEmpty} from '../shared/Helpers';

const useUploadImages = () => {
  // const imagesToUpload = [];
  const tempImagesDownsizedDirectory = APP_DIRECTORIES.APP_DIR + '/TempImages';

  const useDevice = useDeviceHook();
  const useImages = useImagesHook();
  const useServerRequests = useServerRequestsHook();

  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const spots = useSelector(state => state.spot.spots);

  // const [imagesToUpload, setImagesToUpload] = useState([]);
  //
  // useEffect(() => {
  //   console.log('Images to Upload', imagesToUpload)
  // }, [imagesToUpload])

  // Gather all the images in spots and returns the ids.
  const getImageIds = (images) => {
    const imageIds = [];
    // Object.values(spots).forEach(spot => spot?.properties?.images?.map(image => imagesFound.push(image)));
    // console.log('SPOT IMAGES', imagesFound);
    images.forEach((image) => imageIds.push(image.id));
    console.log(imageIds);
    return imageIds;
  };

  // // Get the URI of the image file if it exists on local device
  // const getImageFile = async (imageId) => {
  //   const imageURI = useImages.getLocalImageURI(imageId);
  //   // const isValidImageURI = await useDevice.doesDeviceDirExist(imageURI);
  //   // if (isValidImageURI) {
  //   //   console.log(`Image ${imageId} EXISTS`);
  //   //   return imagesFound.find((image) => {
  //   //     if (image.id.toString() === imageId) {
  //   //       // imagesToUpload.push(imageWithPath);
  //   //       // setImagesToUpload(prevState => ([...prevState, imageWithPath]));
  //   //       return {...image, uri: imageURI};
  //   //     }
  //   //   });
  //   // }
  //   // else {
  //   //   console.log('Local file not found for image:' + imageId);
  //   //   imagesNotFoundOnDevice.push(imageId);
  //   // }
  // };

  const initializeImageUpload = async () => {
    let imagesStatus = {success: 0, failed: 0};
    console.log('Looking for Images to Upload in Spots...', spots);
    dispatch(removedLastStatusMessage());
    dispatch(addedStatusMessage('Looking for images to upload in spots...'));
    const images = useImages.getAllImages();
    const imageIds = getImageIds(images);
    dispatch(removedLastStatusMessage());
    dispatch(addedStatusMessage('Checking to see if image files are on server...'));
    const neededImages = await useServerRequests.verifyImagesExistence(imageIds, user.encoded_login);
    dispatch(removedLastStatusMessage());
    dispatch(addedStatusMessage(`Checking to see if ${neededImages.length} image files are on device...`));
    console.log('Needed Images from server', neededImages);
    const {imagesToUpload, imagesNotFoundOnDevice} = await verifyImageExistsOnDevice(neededImages, images);
    console.log('Done verifying images on device', imagesToUpload);
    //
    if (!isEmpty(imagesToUpload)) {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Uploading needed images to server...'));
      imagesStatus = await uploadImages(imagesToUpload);
      console.log('DONE UPLOADING IMAGES');
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage(`Uploaded ${imagesToUpload.length} to server.`));
    }
    if (!isEmpty(imagesNotFoundOnDevice)) {
      imagesStatus = {...imagesStatus, imagesNotFound: imagesNotFoundOnDevice.length};
    }
    // if (isEmpty(imagesToUpload) && !isEmpty(imagesNotFoundOnDevice)) {
    //   dispatch(removedLastStatusMessage());
    //   imagesStatus = {...imagesStatus, imagesNotFound: imagesNotFoundOnDevice.length};
    // }
    else {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('All images for this project are already on server.'));
    }
    return imagesStatus;
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

  const verifyImageExistsOnDevice = async (neededImageIds, imagesFound) => {
    const imagesToUpload = [];
    const imagesNotFoundOnDevice = [];
    await Promise.all((
      neededImageIds.map(async (imageId) => {
          const imageURI = useImages.getLocalImageURI(imageId);
          const isValidImageURI = await useDevice.doesDeviceDirExist(imageURI);
          if (isValidImageURI) {
            console.log(`Image ${imageId} EXISTS`);
            return imagesFound.find((image) => {
              if (image.id.toString() === imageId) {
                imagesToUpload.push({...image, uri: imageURI});
                // setImagesToUpload(prevState => ([...prevState, imageWithPath]));
                // return {...image, uri: imageURI};
              }
            });
          }
          else {
            console.log('Local file not found for image:' + imageId);
            imagesNotFoundOnDevice.push(imageId);
          }
        },
      )
    ));
    return {imagesToUpload: imagesToUpload, imagesNotFoundOnDevice: imagesNotFoundOnDevice};
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

  const uploadImages = async (imagesToUpload) => {
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
      return ({success: imagesUploadedCount, failed: imagesUploadFailedCount});
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
