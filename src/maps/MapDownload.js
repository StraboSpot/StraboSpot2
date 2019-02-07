import React from 'react';
import {Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

const url = 'https://strabospot.org/testimages/images.json';

export const getMapTiles = async () => {
  let response = await fetch(url);
  let responseJson = await response.json();
  console.log(responseJson);
  return Promise.resolve();
};
