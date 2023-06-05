import {useEffect} from 'react';
import {Alert} from 'react-native';

import RNFS from 'react-native-fs';
import {unzip} from 'react-native-zip-archive';
import {useDispatch, useSelector} from 'react-redux';

import {APP_DIRECTORIES} from '../../../services/directories.constants';
import {STRABO_APIS} from '../../../services/urls.constants';
import useDeviceHook from '../../../services/useDevice';
import useServerRequesteHook from '../../../services/useServerRequests';
import {isEmpty} from '../../../shared/Helpers';
import config from '../../../utils/config';
import {addedStatusMessage, removedLastStatusMessage} from '../../home/home.slice';
import {DEFAULT_MAPS} from '../maps.constants';
import {setCurrentBasemap} from '../maps.slice';
import useMapsHook from '../useMaps';
import {addMapFromDevice, adjustedMapsFromDevice, setOfflineMap} from './offlineMaps.slice';

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
  const user = useSelector(state => state.user);

  const source = currentBasemap && currentBasemap.source;
  const url = 'file://' + APP_DIRECTORIES.TILE_CACHE;

  const useDevice = useDeviceHook();
  const [useMaps] = useMapsHook();
  const [useServerRequests] = useServerRequesteHook();

  useEffect(() => {
    console.log('UE useMapsOffline [isOnline]', isOnline);
  }, [isOnline]);

  const adjustRedux = async (mapFileNames) => {
    Alert.alert('Map Missing on Device!', 'There are some maps that are not on the device that are in the'
      + ' StraboSpot. These have be removed automatically.',
      [{title: 'OK', onPress: value => console.log('Ok pressed', value)}]);
    let adjustedReduxMaps = {};
    let foundMap = '';
    console.log('ADJUST REDUX');
    Object.values(offlineMaps).map((offlineMap) => {
      foundMap = mapFileNames.find(map => offlineMap.id === map);
      if (foundMap) adjustedReduxMaps = {...adjustedReduxMaps, [foundMap]: offlineMaps[foundMap]};
    });
    console.log('ADJUSTED MAPS', adjustedReduxMaps);
    dispatch(adjustedMapsFromDevice(adjustedReduxMaps));
  };

  const addMapFromDeviceToRedux = async (mapId) => {
    const map = await createOfflineMapObject(mapId);
    const mapSavedObject = Object.assign({}, map.source === 'mapbox_styles'
      ? {[map.id.split('/')[1]]: map} : {[map.id]: map});
    dispatch(addMapFromDevice(mapSavedObject));
  };

  const createOfflineMapObject = async (mapId, customMap) => {
    let tileCount = await RNFS.readDir(APP_DIRECTORIES.TILE_CACHE + mapId + '/tiles');
    tileCount = tileCount.length;

    let map = {
      id: mapId,
      name: offlineMaps[mapId]?.name ? offlineMaps[mapId].name : getMapNameFromId(mapId),
      count: tileCount,
      bbox: !isEmpty(customMap) ? customMap[0]?.bbox : '',
      source: !mapId ? source : undefined,
      mapId: zipUID,
      date: new Date().toLocaleString(),
      isOfflineMapVisible: false,
      version: 8,
      sources: {
        'raster-tiles': {
          type: 'raster',
          tiles: ['file://' + APP_DIRECTORIES.TILE_CACHE + mapId + '/tiles/{z}_{x}_{y}.png'],
          tileSize: 256,
        },
      },
      glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      layers: [{
        id: mapId,
        type: 'raster',
        source: 'raster-tiles',
        minzoom: 0,
      }],
    };
    console.log(map);
    return map;
  };

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
    if (APP_DIRECTORIES.ROOT_PATH) {
      const entries = await useDevice.readDirectoryForMapTiles(mapid);
      // loop over tiles to get center tiles
      let maxZoom = 0;
      let xvals = [];
      let yvals = [];

      entries.map((entry) => {
        const parts = entry.replace('.png', '').split('_');
        const z = Number(parts[0]);
        if (z > maxZoom) {
          maxZoom = z;
        }
      });
      if (maxZoom > 14) {
        maxZoom = 14;
      }

      entries.map((entry) => {
        const parts = entry.replace('.png', '').split('_');
        const z = Number(parts[0]);
        const x = Number(parts[1]);
        const y = Number(parts[2]);

        if (z === maxZoom) {
          if (xvals.indexOf(x) === -1) {
            xvals.push(x);
          }
          if (yvals.indexOf(y) === -1) {
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
      let fileExists = await RNFS.exists(APP_DIRECTORIES.TILE_ZIP + zipUID + '.zip');
      console.log('file Exists:', fileExists ? 'YES' : 'NO');
      if (fileExists) {
        //delete
        await RNFS.unlink(APP_DIRECTORIES.TILE_ZIP + zipUID + '.zip');
      }
      // else await RNFS.mkdir(tileZipsDirectory);
    }
    catch (err) {
      console.error('Error checking if zip file exists', err);
    }
  };

  const checkIfTileZipFolderExists = async () => {
    try {
      let folderExists = await RNFS.exists(APP_DIRECTORIES.TILE_ZIP);
      console.log('Folder Exists:', folderExists ? 'YES' : 'NO');
      if (folderExists) {
        //delete
        await RNFS.unlink(APP_DIRECTORIES.TILE_ZIP + zipUID);
      }
      else await RNFS.mkdir(APP_DIRECTORIES.TILE_ZIP);
    }
    catch (err) {
      console.error('Error checking if zip Tile Temp Directory exists', err);
    }
  };

  const doUnzip = async () => {
    try {
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Preparing to install tiles...'));
      const sourcePath = APP_DIRECTORIES.TILE_ZIP + zipUID + '.zip';
      await unzip(sourcePath, APP_DIRECTORIES.TILE_TEMP);
      console.log('unzip completed');
      console.log('move done.');
      await useDevice.deleteProjectOnDevice(APP_DIRECTORIES.TILE_ZIP, zipUID + '.zip');
      console.log('Zip', zipUID, 'has been deleted.');
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
      let mapKey = currentBasemap.id;
      const layerSource = currentBasemap.source;
      const tilehost = STRABO_APIS.TILE_HOST;

      if (layerSource === 'map_warper' || layerSource === 'mapbox_styles' || layerSource === 'strabospot_mymaps') {
        //configure advanced URL for custom map types here.
        //first, figure out what kind of map we are downloading...

        let downloadMap = {};
        if (mapKey.includes('/')) mapKey = mapKey.split('/')[1];
        if (customMaps[mapKey].id === currentBasemap.id) downloadMap = customMaps[mapKey];

        console.log('DownloadMap: ', downloadMap);

        if (downloadMap.source === 'Mapbox Style' || downloadMap.source === 'mapbox_styles') {
          layer = 'mapboxstyles';
          const parts = downloadMap.id.split('/');
          username = parts[0];
          id = parts[1];
          const accessToken = user.mapboxToken && !isEmpty(user.mapboxToken) ? user.mapboxToken : config.get(
            'mapbox_access_token');
          startZipURL = tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + downloadZoom
            + '&username=' + username + '&id=' + id + '&access_token=' + accessToken;
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
        startZipURL = tilehost + '/asynczip?layer=' + layer + '&extent=' + extentString + '&zoom=' + downloadZoom;
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

  const moveFiles = async (zipUId) => {
    try {
      let result;
      let mapID = currentBasemap.id;
      if (currentBasemap.source === 'mapbox_styles') mapID = currentBasemap.id.split('/')[1];
      let folderExists = await RNFS.exists(APP_DIRECTORIES.TILE_CACHE + mapID);
      if (!folderExists) {
        console.log('FOLDER DOESN\'T EXIST! ', APP_DIRECTORIES.TILE_CACHE + mapID);
        await RNFS.mkdir(APP_DIRECTORIES.TILE_CACHE + mapID + '/tiles');
      }
      //now move files to correct location
      result = await RNFS.readDir(APP_DIRECTORIES.TILE_TEMP + zipUId + '/tiles');
      return result;
    }
    catch (err) {
      console.error('Error moving tiles', err);
      throw new Error(err);
    }
  };

  const moveTile = async (tile, zipID) => {
    let mapID = currentBasemap.id;
    if (currentBasemap.source === 'mapbox_styles') mapID = currentBasemap.id.split('/')[1];
    let zipId = zipUID ?? zipID;
    fileCount++;
    let fileExists = await RNFS.exists(APP_DIRECTORIES.TILE_CACHE + mapID + '/tiles/' + tile.name);
    // console.log('foo exists: ', tile.name + ' ' + fileExists);
    if (!fileExists) {
      neededTiles++;
      await RNFS.copyFile(APP_DIRECTORIES.TILE_TEMP + zipId + '/tiles/' + tile.name,
        APP_DIRECTORIES.TILE_CACHE + mapID + '/tiles/' + tile.name);
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

  const getMapNameFromId = (mapID) => {
    const mapObj = DEFAULT_MAPS.find(mapType => mapType.id === mapID);
    if (!mapObj) {
      return customMaps[mapID]?.title;
    }
    return mapObj.title;
  };

  const updateMapTileCount = async (mapId) => {
    try {
      // let mapName;
      let mapID = mapId ? mapId : currentBasemap.id;
      if (currentBasemap.source === 'mapbox_styles') mapID = currentBasemap.id.split('/')[1];
      let currentOfflineMaps = Object.values(offlineMaps);

      //now check for existence of AsyncStorage offlineMapsData and store new count
      if (!currentOfflineMaps) {
        currentOfflineMaps = [];
      }

      const customMap = Object.values(customMaps).filter((map) => {
        const customMapID = map.source === 'mapbox_styles' ? map.id.split('/')[1] : map.id;
        return mapID === customMapID;
      });
      console.log(customMap);
      const newOfflineMapsData = await createOfflineMapObject(mapID, customMap);
      console.log(newOfflineMapsData);
      await dispatch(setOfflineMap(newOfflineMapsData));
      console.log('Map to save to Redux', newOfflineMapsData);
    }
    catch (err) {
      console.error('Error updating map object', err);
    }
  };

  const getSavedMapsFromDevice = async () => {
    try {
      const files = await useDevice.readDirectoryForMapFiles();
      if (files.length === Object.values(offlineMaps).length) {
        if (!isEmpty(files)) {
          files.map(async (file) => {
            const isMapInRedux = Object.keys(offlineMaps).includes(file);
            console.log(isMapInRedux);
            if (isMapInRedux) {
              console.log('Offline Map', offlineMaps[file]);
              const mapId = offlineMaps[file].id;
              const tileCount = await RNFS.readDir(APP_DIRECTORIES.TILE_CACHE + mapId + '/tiles');
              const tileCountLength = tileCount.length;
              console.log('tileCount', tileCount);
              const newOfflineMapCount = {...offlineMaps[file], count: tileCountLength};
              console.log('newOfflineMapCount', newOfflineMapCount);
              dispatch(setOfflineMap(newOfflineMapCount));
            }
            else await addMapFromDeviceToRedux(file);
          });
        }
      }
      else {
        await adjustRedux(files);
        console.log('REDUX ADJUSTED');
      }
    }
    catch (err) {
      console.log('Error getting saved maps from device', err);
    }
  };


  const setOfflineMapTiles = async (map) => {
    console.log('Switch To Offline Map: ', map);
    const tilePath = '/tiles/{z}_{x}_{y}.png';
    const mapStyleURL = useMaps.buildStyleURL({...map, tilePath: tilePath, url: [url]});
    console.log('tempCurrentBasemap: ', mapStyleURL);
    dispatch(setCurrentBasemap(mapStyleURL));
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
  };

  return {
    addMapFromDeviceToRedux: addMapFromDeviceToRedux,
    checkTileZipFileExistance: checkTileZipFileExistance,
    checkIfTileZipFolderExists: checkIfTileZipFolderExists,
    doUnzip: doUnzip,
    getMapCenterTile: getMapCenterTile,
    getMapName: getMapName,
    getMapTiles: getMapTiles,
    initializeSaveMap: initializeSaveMap,
    moveFiles: moveFiles,
    moveTile: moveTile,
    getSavedMapsFromDevice: getSavedMapsFromDevice,
    saveZipMap: saveZipMap,
    setOfflineMapTiles: setOfflineMapTiles,
    updateMapTileCount: updateMapTileCount,
    switchToOfflineMap: switchToOfflineMap,
  };
};

export default useMapsOffline;
