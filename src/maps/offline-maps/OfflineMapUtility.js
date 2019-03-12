import React from 'react';
import {Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {unzip} from 'react-native-zip-archive'; /*TODO  react-native-zip-archive@3.0.1 requires a peer of react@^15.4.2 || <= 16.3.1 but none is installed */

const tilehost = 'http://tiles.strabospot.org';
const url = 'https://strabospot.org/testimages/images.json';

let dirs = RNFetchBlob.fs.dirs;
const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
const tilesDirectory = '/StraboSpotTiles';
const tileZipsDirectory = devicePath + tilesDirectory + '/TileZips';
const tileCacheDirectory = devicePath + tilesDirectory + '/TileCache';

let zipError = '';
let progressMessage = '';
let percentDownload = 0;
let percentDone = 0;
let tryCount = 0;

// Start getting the tiles to download by creating a zip url
export const getMapTiles = async (mapBounds) => {
  console.log('mapBounds', mapBounds);

  // RN Maps
  /*  let right = mapBounds.northEast.longitude;
    let top = mapBounds.northEast.latitude;
    let left = mapBounds.southWest.longitude;
    let bottom = mapBounds.southWest.latitude;*/

  let right = mapBounds[0][0];
  let top = mapBounds[0][1];
  let left = mapBounds[1][0];
  let bottom = mapBounds[1][1];
  let extentString = left + ',' + bottom + ',' + right + ',' + top;

  const mapID = '2a542a65-ab88-fc7d-c35e-961cd23339d4';
  const layerID = 'mapbox.outdoors';
  const selectedMaxZoom = 17;

  let startZipURL = tilehost + '/asynczip?mapid=' + mapID + '&layer=' + layerID + '&extent=' + extentString + '&zoom=' + selectedMaxZoom;
  await saveZipMap(startZipURL);
  return Promise.resolve();
};

const saveZipMap = async (startZipURL) => {
  let response = await fetch(startZipURL);
  let responseJson = await response.json();
  console.log('responsejson', responseJson);
  const zipUID = responseJson.id;
  if (zipUID) {
    await checkStatus(zipUID);
  }
  return Promise.resolve();
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const checkStatus = async (zipUID) => {
  const checkZipURL = tilehost + '/asyncstatus/' + zipUID;
  try {
    let response = await fetch(checkZipURL);
    let responseJson = await response.json();
    if (responseJson.error) {
      zipError = responseJson.error;
      progressMessage = responseJson.error;
      percentDone = 100;
    }
    else {
      if (progressMessage !== 'Downloading Tiles...') {
        progressMessage = responseJson.status;
        percentDownload = responseJson.percent;
      }
    }
  } catch {
    console.log('Network Error');
  }
  tryCount++;

  if (tryCount <= 200 && progressMessage !== 'Zip File Ready.' && zipError === '') {
    await delay(1000);
    await checkStatus(zipUID);
  }
  else {
    progressMessage = 'Downloading Tiles...';
    await downloadZip(zipUID);
    await delay(3000);
    await doUnzip(zipUID);
  }
};

const downloadZip = async (zipUID) => {
  try {
    const downloadZipURL = tilehost + '/ziptemp/' + zipUID + '/' + zipUID + '.zip';
    let res = await RNFetchBlob
      .config({path: tileZipsDirectory + '/' + zipUID + '.zip'})
      .fetch('GET', downloadZipURL, {});
    console.log('Zip file saved to', res.path());
  } catch (err) {
    console.log('Download Tile Zip Error :', err);
  }
};

const doUnzip = async (zipUID) => {
  progressMessage = 'Installing Tiles in StraboSpot...';

  const sourcePath = tileZipsDirectory + '/' + zipUID + '.zip';
  const targetPath = tileCacheDirectory;

  try {
    let path = await unzip(sourcePath, targetPath);
    console.log(`unzip completed at ${path}`)
  } catch (err) {
    console.log('Unzip Error:', err);
  }

  return Promise.resolve();
};
