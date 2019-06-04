import React from 'react';
import {Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

let imagePaths = [];
let imageCount = 0;
let dirs = RNFetchBlob.fs.dirs;
const url = 'https://strabospot.org/testimages/images.json';
const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
const appDirectory = '/StraboSpot';
const imagesDirectory = devicePath + appDirectory + '/Images';

export const getRemoteImages = async () => {
  let response = await fetch(url);
  let responseJson = await response.json();
  let imageURIs = responseJson.images.map(imageUris => imageUris.URI);
  for (let i = 0; i < imageURIs.length - 490; i++) {
    // await saveFile(imageURIs[i]);
  }
  return Promise.resolve();
};

export const getImages = () => {
  return imagePaths;
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
    if (Platform.OS === "ios") imageData = {id: imageId, src: res.path(), height: imageURI.height, width: imageURI.width};
    else imageData ={id: imageId, src: 'file://' + res.path(), height: imageURI.height, width: imageURI.width};
    return imageData;
  } catch (err) {
    imageCount++;
    console.log(imageCount, 'Error on', imageName, ':', err);
  }
};
