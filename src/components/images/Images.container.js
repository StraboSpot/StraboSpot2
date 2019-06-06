import React, {useState, useEffect} from 'react'
import {Alert, Image, Platform, View} from "react-native";
import ImagePicker from "react-native-image-picker";
import imageStyles from './images.styles'
import RNFetchBlob from "rn-fetch-blob";


// export const imageMap = () => {
//   Object.values(this.props.imagePaths).map(image => {
//   return <Image key={image} style={imageStyles.image} source={{uri: image}}/>
// })};
// const imageContainer = props => {

let allPhotosSaved = [];
let imagePaths = [];
let imageCount = 0;
let dirs = RNFetchBlob.fs.dirs;
const url = 'https://strabospot.org/testimages/images.json';
const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
const appDirectory = '/StraboSpot';
const imagesDirectory = devicePath + appDirectory + '/Images';

const imageOptions = {
  storageOptions: {
    skipBackup: true,
  },
  title: 'Choose Photo Source'
};

export const pictureSelectDialog = async () => {
  console.log('ALLPHOTOSSAVEDARR')

  return new Promise((resolve, reject) => {
    ImagePicker.showImagePicker(imageOptions, async (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        resolve('cancelled')
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        return reject('Error', response.error)
      }
      else {
        const savedPhoto = await saveFile(response);
        console.log('Saved Photo = ', savedPhoto);
        resolve(savedPhoto)
      }
    });
  })
};

export const saveFile = async (imageURI) => {
  let uriParts = imageURI.uri.split('/');
  let imageName = uriParts[uriParts.length - 1];
  try {
    let res = await RNFetchBlob
      .config({path: imagesDirectory + '/' + imageName})
      .fetch('GET', imageURI.uri, {});
    imageCount++;
    console.log(imageCount, 'File saved to', res.path());
    let imageId = imageName.split(".")[0];
    let imageData = {};
    if (Platform.OS === "ios") imageData = {
      id: imageId,
      src: res.path(),
      height: imageURI.height,
      width: imageURI.width
    };
    else imageData = {id: imageId, src: 'file://' + res.path(), height: imageURI.height, width: imageURI.width};
    return imageData;
  } catch (err) {
    imageCount++;
    console.log(imageCount, 'Error on', imageName, ':', err);
  }
};
