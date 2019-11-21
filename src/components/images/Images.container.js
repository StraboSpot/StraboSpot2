import React from 'react';
import {Alert, Image, Platform, View} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';


// export const imageMap = () => {
//   Object.values(this.props.imagePaths).map(image => {
//   return <Image key={image} style={imageStyles.image} source={{uri: image}}/>
// })};
// const imageContainer = props => {

let imageCount = 0;
let dirs = RNFetchBlob.fs.dirs;
const url = 'https://strabospot.org/testimages/images.json';
const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
const appDirectory = '/StraboSpot';
const imagesDirectory = devicePath + appDirectory + '/Images';

// Called from Image Gallery and displays image source picker
export const pictureSelectDialog = async () => {
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

export const saveFile = async (imageURI) => {
  let uriParts = imageURI.uri.split('/');
  let imageName = uriParts[uriParts.length - 1];
  return new Promise((resolve, reject) => {
    RNFetchBlob
      .config({path: imagesDirectory + '/' + imageName})
      .fetch('GET', imageURI.uri, {})
      .then((res) => {
        imageCount++;
        console.log(imageCount, 'File saved to', res.path());
        let imageId = imageName.split('.')[0];
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
        console.log('Error on', imageName, ':', errorMessage, statusCode);  // Android Error: RNFetchBlob request error: url == nullnull
        reject();
      });
  });
};

// Called from Notebook Panel Footer and opens camera only
export const takePicture = async () => {
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

