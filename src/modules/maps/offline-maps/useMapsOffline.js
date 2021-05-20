import {useEffect} from 'react';
import {Alert} from 'react-native';

import RNFS from 'react-native-fs';
import {unzip} from 'react-native-zip-archive';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../../services/useDevice';
import useServerRequesteHook from '../../../services/useServerRequests';
import {isEmpty} from '../../../shared/Helpers';
import {addedStatusMessage, removedLastStatusMessage} from '../../home/home.slice';
import {setCurrentBasemap} from '../maps.slice';
import {setOfflineMap} from './offlineMaps.slice';

const useMapsOffline = () => {
  let zipUID;
  let fileCount = 0;
  let neededTiles = 0;
  let notNeededTiles = 0;

  const dispatch = useDispatch();
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const customMaps = useSelector(state => state.map.customMaps);
  const isOnline = useSelector(state => state.home.isOnline);
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);

  const source = currentBasemap && currentBasemap.source;
  const currentMapName = currentBasemap && currentBasemap.title;

  const devicePath = RNFS.DocumentDirectoryPath;
  const tilesDirectory = '/StraboSpotTiles';
  const tileCacheDirectory = devicePath + tilesDirectory + '/TileCache';
  const tileTempDirectory = devicePath + tilesDirectory + '/TileTemp';
  const tileZipsDirectory = devicePath + tilesDirectory + '/TileZips';

  const useDevice = useDeviceHook();
  const [useServerRequests] = useServerRequesteHook();

  useEffect(() => {

  }, [isOnline]);

  const getMapName = (map) => {
    if (map.id === 'mapbox.outdoors' || map.id === 'mapbox.satellite' || map.id === 'osm'
      || map.id === 'macrostrat' || map.source === 'map_warper' || map.source === 'strabospot_mymaps') {
      return map.name;
    }
    else return null;
  };

  const getMedian = (arr) => {
    arr = arr.slice(0); // create copy
    const middle = (arr.length + 1) / 2,
      sorted = arr.sort(function (a, b) {
        return a - b;
      });
    return (sorted.length % 2) ? sorted[middle - 1] : (sorted[middle - 1.5] + sorted[middle - 0.5]) / 2;
  };


  // borrowed from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
  const tile2long = (x, z) => {
    return (x / Math.pow(2, z) * 360 - 180);
  };

  // borrowed from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
  const tile2lat = (y, z) => {
    const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  };

  const getMapCenterTile = async (mapid) => {
    if (devicePath) {
      const entries = await useDevice.readDirectoryForMapTiles(mapid);
      // loop over tiles to get center tiles
      let maxZoom = 0;
      let xvals = [];
      let yvals = [];

      entries.map((entry, index) => {
        const parts = entry.replace('.png', '').split('_');
        const z = Number(parts[0]);
        if (z > maxZoom) {
          maxZoom = z;
        }
      });
      if (maxZoom > 14) {
        maxZoom = 14;
      }

      entries.map(entry => {
        const parts = entry.replace('.png', '').split('_');
        const z = Number(parts[0]);
        const x = Number(parts[1]);
        const y = Number(parts[2]);

        if (z == maxZoom) {
          if (xvals.indexOf(x) == -1) {
            xvals.push(x);
          }
          if (yvals.indexOf(y) == -1) {
            yvals.push(y);
          }
        }
      });

      let middleX = Math.floor(getMedian(xvals));
      let middleY = Math.floor(getMedian(yvals));

      let centerTile = maxZoom + '_' + middleX + '_' + middleY;
      const parts = centerTile.split('_');
      const z = Number(parts[0]);
      const x = Number(parts[1]);
      const y = Number(parts[2]);
      const lng = tile2long(x, z);
      const lat = tile2lat(y, z);
      return [lng, lat];
    }
  };

  const checkTileZipFileExistance = async () => {
    try {
      let fileExists = await RNFS.exists(tileZipsDirectory + '/' + zipUID + '.zip');
      console.log('file Exists:', fileExists ? 'YES' : 'NO');
      if (fileExists) {
        //delete
        await RNFS.unlink(tileZipsDirectory + '/' + zipUID + '.zip');
      }
      // else await RNFS.mkdir(tileZipsDirectory);
    }
    catch (err) {
      console.error('Error checking if zip file exists', err);
    }
  };

  const checkIfTileZipFolderExists = async () => {
    try {
      let folderExists = await RNFS.exists(tileZipsDirectory);
      console.log('Folder Exists:', folderExists ? 'YES' : 'NO');
      if (folderExists) {
        //delete
        await RNFS.unlink(tileZipsDirectory + '/' + zipUID);
      }
      else await RNFS.mkdir(tileZipsDirectory);
    }
    catch (err) {
      console.error('Error checking if zip Tile Temp Directory exists', err);
    }
  };

  const doUnzip = async () => {
    try {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Preparing to install tiles...'));
      const sourcePath = tileZipsDirectory + '/' + zipUID + '.zip';
      await unzip(sourcePath, tileTempDirectory);
      console.log('unzip completed');
      console.log('move done.');
    }
    catch (err) {
      console.error('Unzip Error:', err);
    }
  };

  // Start getting the tiles to download by creating a zip url
  const getMapTiles = async (extentString, downloadZoom) => {
    try {
      let layer, id, username;
      let startZipURL = 'unset';
      const layerID = currentBasemap.id;
      const layerSource = currentBasemap.source;
      const tilehost = 'http://tiles.strabospot.org';

      if (layerSource === 'map_warper' || layerSource === 'mapbox_styles' || layerSource === 'strabospot_mymaps') {
        //configure advanced URL for custom map types here.
        //first, figure out what kind of map we are downloading...

        let downloadMap = {};

        if (customMaps[layerID].id === currentBasemap.id) {
          downloadMap = customMaps[layerID];
        }

        console.log('DownloadMap: ', downloadMap);

        if (downloadMap.source === 'Mapbox Style' || downloadMap.source === 'mapbox_styles') {
          layer = 'mapboxstyles';
          const parts = downloadMap.id.split('/');
          username = parts[0];
          id = parts[1];
          const accessToken = downloadMap.key;
          startZipURL = tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + downloadZoom + '&username=' + username + '&id=' + id + '&access_token=' + accessToken;
        }
        else if (downloadMap.source === 'Map Warper' || downloadMap.source === 'map_warper') {
          layer = 'mapwarper';
          id = downloadMap.id;
          startZipURL = tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + downloadZoom + '&id=' + id;
        }
        else if (downloadMap.source === 'strabospot_mymaps') {
          layer = 'strabomymaps';
          id = downloadMap.id;
          startZipURL = tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + downloadZoom + '&id=' + id;
        }
      }
      else {
        layer = currentBasemap.id;
        startZipURL = tilehost + '/asynczip?layer=' + layerID + '&extent=' + extentString + '&zoom=' + downloadZoom;
      }

      console.log('startZipURL: ', startZipURL);
      return startZipURL;
    }
    catch (err) {
      console.error('Error Getting Map Tiles.', err);
      throw new Error(err);
    }
  };

  const initializeSaveMap = async (extentString, downloadZoom) => {
    try {
      const startZipUrl = await getMapTiles(extentString, downloadZoom);
      await saveZipMap(startZipUrl);
      return zipUID;
    }
    catch (err) {
      console.error('Error Initializing Saving Map', err);
      throw Error(err);
    }
  };

  const moveFiles = async (zipUID) => {
    try {
      let result;
      let folderExists = await RNFS.exists(tileCacheDirectory + '/' + currentBasemap.id);
      if (!folderExists) {
        console.log('FOLDER DOESN\'T EXIST! ' + currentBasemap.id);
        await RNFS.mkdir(tileCacheDirectory + '/' + currentBasemap.id);
        await RNFS.mkdir(tileCacheDirectory + '/' + currentBasemap.id + '/tiles');
      }
      //now move files to correct location
      result = await RNFS.readDir(tileTempDirectory + '/' + zipUID + '/tiles');
      return result;
    }
    catch (err) {
      console.error('Error moving tiles', err);
      throw new Error(err);
    }
  };

  const moveTile = async (tile, zipID) => {
    let zipId = zipUID ?? zipID;
    fileCount++;
    let fileExists = await RNFS.exists(tileCacheDirectory + '/' + currentBasemap.id + '/tiles/' + tile.name);
    // console.log('foo exists: ', tile.name + ' ' + fileExists);
    if (!fileExists) {
      neededTiles++;
      await RNFS.moveFile(tileTempDirectory + '/' + zipId + '/tiles/' + tile.name,
        tileCacheDirectory + '/' + currentBasemap.id + '/tiles/' + tile.name);
      console.log('Tile moved');
    }
    else notNeededTiles++;
    return [fileCount, neededTiles, notNeededTiles];
  };

  const saveZipMap = async (startZipURL) => {
    try {
      const tileJson = await useServerRequests.getMapTilesFromHost(startZipURL);
      zipUID = tileJson.id;
      // if (zipUID) return;
    }
    catch (err) {
      console.error('Error in saveMapZip', err);
      throw new Error(err);
    }
  };

  const setOfflineMapTiles = async (map) => {
    let tempCurrentBasemap, tilePath;
    console.log('Switch To Offline Map: ', map);
    const url = 'file://' + tileCacheDirectory + '/';

    // let tileJSON = 'file://' + tileCacheDirectory + '/' + map.id + '/tiles/{z}_{x}_{y}.png';
    if (map.source === 'map_warper') {
      tilePath = 'tiles/{z}_{x}_{y}.png';
    }
    else {
      tilePath = '/tiles/{z}_{x}_{y}.png';
    }

    tempCurrentBasemap = {...map, url: [url], tilePath: tilePath};
    console.log('tempCurrentBasemap: ', tempCurrentBasemap);
    dispatch(setCurrentBasemap(tempCurrentBasemap));
  };

  const updateMapTileCount = async () => {
    try {
      let mapName;
      let tileCount = await RNFS.readDir(tileCacheDirectory + '/' + currentBasemap.id + '/tiles');
      tileCount = tileCount.length;

      let currentOfflineMaps = Object.values(offlineMaps);

      //now check for existence of AsyncStorage offlineMapsData and store new count
      if (!currentOfflineMaps) {
        currentOfflineMaps = [];
      }

      const customMap = Object.values(customMaps).filter(map => currentBasemap.id === map.id);
      console.log(customMap);
      if (source === 'strabo_spot_mapbox' || source === 'osm' || source === 'macrostrat') mapName = currentMapName;
      else mapName = customMap[0].title;

      let newOfflineMapsData = [];
      let thisMap = {};
      thisMap.id = currentBasemap.id;
      thisMap.name = mapName;
      thisMap.count = tileCount;
      thisMap.source = source;
      // thisMap.mapId = new Date().valueOf();
      thisMap.mapId = zipUID;
      thisMap.date = new Date().toLocaleString();
      thisMap.isOfflineMapVisible = false;
      newOfflineMapsData.push(thisMap);

      //loop over offlineMapsData and add any other maps (not current)
      for (let i = 0; i < currentOfflineMaps.length; i++) {
        if (currentOfflineMaps[i].id) {
          if (currentOfflineMaps[i].id !== currentBasemap.id) {
            //Add it to new array for Redux Storage
            newOfflineMapsData.push(currentOfflineMaps[i]);
          }
        }
      }

      const mapSavedObject = Object.assign({}, ...newOfflineMapsData.map(map => ({[map.id]: map})));
      console.log('Map to save to Redux', mapSavedObject);

      await dispatch(setOfflineMap(mapSavedObject));
      console.log('Saved offlineMaps to Redux.');
    }
    catch (err) {
      console.error('Error updating map object', err);
    }
  };

  const switchToOfflineMap = async (mapId) => {
    if (!isEmpty(offlineMaps)) {
      const selectedOfflineMap = mapId ? offlineMaps[mapId] : offlineMaps[currentBasemap.id];
      if (selectedOfflineMap) {
        console.log('SelectedOfflineMap', selectedOfflineMap);
        // Alert.alert('Selected Offline Map', `${JSON.stringify(selectedOfflineMap)}`)
        await setOfflineMapTiles(selectedOfflineMap);
      }
      else {
        const firstAvailableOfflineMap = Object.values(offlineMaps)[0];

        Alert.alert(
          'Not Available',
          'Selected map is not available for offline use.  '
          + `${firstAvailableOfflineMap.name} is available`, [
            {text: 'Use this map', onPress: () => setOfflineMapTiles(firstAvailableOfflineMap), style: 'destructive'},
          ]);
      }
    }
    else if (isEmpty(offlineMaps)) Alert.alert('No Offline Maps Available!');
  };

  return {
    checkTileZipFileExistance: checkTileZipFileExistance,
    checkIfTileZipFolderExists: checkIfTileZipFolderExists,
    doUnzip: doUnzip,
    getMapCenterTile: getMapCenterTile,
    getMapName: getMapName,
    getMapTiles: getMapTiles,
    initializeSaveMap: initializeSaveMap,
    moveFiles: moveFiles,
    moveTile: moveTile,
    saveZipMap: saveZipMap,
    setOfflineMapTiles: setOfflineMapTiles,
    updateMapTileCount: updateMapTileCount,
    switchToOfflineMap: switchToOfflineMap,
  };
};

export default useMapsOffline;
