import {useEffect, useState, useRef} from 'react';
import {Alert, Platform} from 'react-native';

import RNFS, {stat} from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequesteHook from '../../../services/useServerRequests';
import {isEmpty} from '../../../shared/Helpers';
import {setCurrentBasemap} from '../maps.slice';
import useDeviceHook from '../../../services/useDevice';
import {setOfflineMap} from './offlineMaps.slice';

const useMapsOffline = () => {
  let progressStatus = '';
  let tryCount = 0;
  let zipUID;

  const [percentDone, setPercentDone] = useState(0);

  const dispatch = useDispatch();
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const customMaps = useSelector(state => state.map.customMaps);
  const isOnline = useSelector(state => state.home.isOnline);
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);

  const devicePath = RNFS.DocumentDirectoryPath;
  const tilesDirectory = '/StraboSpotTiles';
  const tileCacheDirectory = devicePath + tilesDirectory + '/TileCache';
  const tilehost = 'http://tiles.strabospot.org';
  const tileTempDirectory = devicePath + tilesDirectory + '/TileTemp';
  const tileZipsDirectory = devicePath + tilesDirectory + '/TileZips';

  const useDevice = useDeviceHook();
  const [useServerRequests] = useServerRequesteHook();

  useEffect(() => {

  }, [isOnline]);

  const getMapName = (map) => {
    if (map.id === 'mapbox.outdoors' || map.id === 'mapbox.satellite' || map.id === 'osm'
      || map.id === 'macrostrat' || map.source === 'map_warper') {
      return map.name;
    }
    else return;
  };

  const checkTileZipFileExistance = async (layerSaveId) => {
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

  // Start getting the tiles to download by creating a zip url
  const getMapTiles = async (extentString, downloadZoom) => {
    try {
      let layer, id, username;
      let startZipURL = 'unset';
      const layerID = currentBasemap.id;
      const layerSource = currentBasemap.source;

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
      // await saveZipMap(startZipURL);
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
      const status = await useServerRequests.zipURLStatus(tilehost + '/asyncstatus/' + zipUID);
      console.log('Status', status);
      return zipUID;
    }
    catch (err) {
      console.error('Error Initializing Saving Map', err);
      throw Error(err);
    }
  };

  // const moveFiles = async (zipUID) => {
  //   // setStatusMessage('Installing tiles...');
  //   let result, mapName;
  //   let folderExists = await RNFS.exists(tileCacheDirectory + '/' + id);
  //   if (!folderExists) {
  //     console.log('FOLDER DOESN\'T EXIST! ' + id);
  //     await RNFS.mkdir(tileCacheDirectory + '/' + id);
  //     await RNFS.mkdir(tileCacheDirectory + '/' + id + '/tiles');
  //   }
  //
  //   //now move files to correct location
  //   //MainBundlePath // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
  //   if (Platform.OS === 'ios') result = await RNFS.readDir(tileTempDirectory + '/' + zipUID + '/tiles');
  //   else result = await RNFS.DocumentDirectoryPath(tileTempDirectory + '/' + zipUID + '/tiles');
  //
  //   console.log(result);
  //
  //   await tileMove(result, zipUID);
  //   let tileCount = await RNFS.readDir(tileCacheDirectory + '/' + id + '/tiles');
  //   tileCount = tileCount.length;
  //
  //   let currentOfflineMaps = Object.values(offlineMaps);
  //
  //   //now check for existence of AsyncStorage offlineMapsData and store new count
  //   if (!currentOfflineMaps) {
  //     currentOfflineMaps = [];
  //   }
  //
  //   const customMap = Object.values(customMaps).filter(map => id === map.id);
  //   console.log(customMap);
  //   if (source === 'strabo_spot_mapbox' || source === 'osm' || source === 'macrostrat') mapName = currentMapName;
  //   else mapName = customMap[0].title;
  //
  //
  //   let newOfflineMapsData = [];
  //   let thisMap = {};
  //   thisMap.id = id;
  //   thisMap.name = mapName;
  //   thisMap.count = tileCount;
  //   // thisMap.mapId = new Date().valueOf();
  //   thisMap.mapId = zipUID;
  //   thisMap.date = new Date().toLocaleString();
  //   newOfflineMapsData.push(thisMap);
  //
  //   //loop over offlineMapsData and add any other maps (not current)
  //   for (let i = 0; i < currentOfflineMaps.length; i++) {
  //     if (currentOfflineMaps[i].id) {
  //       if (currentOfflineMaps[i].id !== id) {
  //         //Add it to new array for Redux Storage
  //         newOfflineMapsData.push(currentOfflineMaps[i]);
  //       }
  //     }
  //   }
  //
  //   const mapSavedObject = Object.assign({}, ...newOfflineMapsData.map(map => ({[map.id]: map})));
  //   console.log('Map to save to Redux', mapSavedObject);
  //
  //   await dispatch(setOfflineMap(mapSavedObject));
  //   console.log('Saved offlineMaps to Redux.');
  // };

  // const tileMove = async (tilearray, zipUID) => {
  //   let fileCount = 0;
  //   let neededTiles = 0;
  //   let notNeededTiles = 0;
  //   for (const tile of tilearray) {
  //     fileCount++;
  //     let fileExists = await RNFS.exists(tileCacheDirectory + '/' + id + '/tiles/' + tile.name);
  //     // console.log('foo exists: ', tile.name + ' ' + fileExists);
  //     if (!fileExists) {
  //       neededTiles++;
  //       setTilesToInstall(neededTiles);
  //       await RNFS.moveFile(tileTempDirectory + '/' + zipUID + '/tiles/' + tile.name,
  //         tileCacheDirectory + '/' + id + '/tiles/' + tile.name);
  //       // console.log(tile);
  //     }
  //     else {
  //       notNeededTiles++;
  //       setInstalledTiles(notNeededTiles);
  //     }
  //     setPercentDone(fileCount / tilearray.length);
  //   }
  // };

  const saveZipMap = async (startZipURL) => {
    try {
      const tileJson = await useServerRequests.getMapTilesFromHost(startZipURL);
      zipUID = tileJson.id;
      if (zipUID) {
        console.log(zipUID);
        return zipUID;
        // await checkStatus(zipUID);
      }
    }
    catch (err) {
      console.error('Error in saveMapZip', err);
    }
  };

  const setOfflineMapTiles = async (map) => {
    let tempCurrentBasemap, tilePath;
    console.log('viewOfflineMap: ', map);
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

  const viewOfflineMap = async () => {
    if (!isEmpty(offlineMaps)) {
      const selectedOfflineMap = offlineMaps[currentBasemap.id];
      if (selectedOfflineMap !== undefined) {
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
    getMapName: getMapName,
    checkTileZipFileExistance: checkTileZipFileExistance,
    checkIfTileZipFolderExists: checkIfTileZipFolderExists,
    getMapTiles: getMapTiles,
    initializeSaveMap: initializeSaveMap,
    saveZipMap: saveZipMap,
    setOfflineMapTiles: setOfflineMapTiles,
    viewOfflineMap: viewOfflineMap,
  };
};

export default useMapsOffline;
