import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Platform, Text, View} from 'react-native';

import {Picker} from '@react-native-picker/picker';
import {Button} from 'react-native-elements';
import RNFS from 'react-native-fs';
import {Dialog, DialogContent, SlideAnimation} from 'react-native-popup-dialog';
import ProgressBar from 'react-native-progress/Bar';
import {useDispatch, useSelector} from 'react-redux';

import {APP_DIRECTORIES, STRABO_APIS} from '../../../services/deviceAndAPI.constants';
import useDeviceHook from '../../../services/useDevice';
import useServerRequestHook from '../../../services/useServerRequests';
import commonStyles from '../../../shared/common.styles';
import {toNumberFixedValue} from '../../../shared/Helpers';
import * as themes from '../../../shared/styles.constants';
// import ProgressBar from '../../../shared/ui/ProgressBar';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setOfflineMapsModalVisible,
} from '../../home/home.slice';
import {MAP_PROVIDERS} from '../maps.constants';
import styles from './offlineMaps.styles';
import useMapsOfflineHook from './useMapsOffline';

const SaveMapsModal = ({map: {getCurrentZoom, getExtentString, getTileCount}}) => {
  console.log('Rendering SaveMapsModal...');

  const useDevice = useDeviceHook();
  const useMapsOffline = useMapsOfflineHook();
  const [useServerRequests] = useServerRequestHook();

  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const isOfflineMapModalVisible = useSelector(state => state.home.isOfflineMapModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);
  const dispatch = useDispatch();

  const currentMapName = currentBasemap && currentBasemap.title;
  const maxZoom = MAP_PROVIDERS[currentBasemap.source]?.maxZoom;
  let progressStatus = '';

  const [tileCount, setTileCount] = useState(0);
  const [installedTiles, setInstalledTiles] = useState(0);
  const [tilesToInstall, setTilesToInstall] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMainMenu, setShowMainMenu] = useState(true);
  const [showLoadingMenu, setShowLoadingMenu] = useState(false);
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const [isLoadingWave, setIsLoadingWave] = useState(false);
  const [isLoadingCircle, setIsLoadingCircle] = useState(false);
  const [percentDone, setPercentDone] = useState(0);
  const [downloadZoom, setDownloadZoom] = useState(0);
  const [zoomLevels, setZoomLevels] = useState([]);
  const [extentString, setExtentString] = useState('');

  useEffect(() => {
    console.log('UE SaveMapsModal []');
    return function cleanUp() {
      console.log('UE CLEANUP SaveMapsModal');
      setInstalledTiles(0);
      setTilesToInstall(0);
      setPercentDone(0);
    };
  }, []);

  useEffect(() => {
    console.log('UE SaveMapsModal [map Props]');
    if (getCurrentZoom) {
      getCurrentZoom().then((zoom) => {
        let initialZoom = [];
        let currentZoom = Math.round(zoom);
        setDownloadZoom(Math.round(zoom));

        const numZoomLevels = maxZoom ? Math.min(maxZoom - currentZoom + 1, 6) : 5;

        for (let i = 0; i < numZoomLevels; i++) {
          initialZoom.push(currentZoom + i);
        }
        setZoomLevels(initialZoom);
      });

      getExtentString().then((ex) => {
        console.log('Extent String', ex);
        setExtentString(ex);
      });
    }
  }, [getCurrentZoom]);

  useEffect(() => {
    console.log('UE SaveMapsModal [downloadZoom]', downloadZoom);
    console.log('extentString is UE', extentString);
    if (downloadZoom > 0) {
      setIsLoadingCircle(true);
      updateCount().then(() => {
        console.log('TileCount', tileCount);

      });
    }
  }, [downloadZoom]);

  useEffect(() => {
    console.log('UE SaveMapsModal [progressStatus]', progressStatus);
  }, [progressStatus]);

  const checkZipStatus = async (zipId) => {
    try {
      const status = await useServerRequests.zipURLStatus(zipId);
      if (status.status !== 'Zip File Ready.') await checkZipStatus(zipId);
    }
    catch (err) {
      console.error('Error checking zip status', err);
      throw new Error(err);
    }
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const doUnzip = async () => {
    try {
      setIsLoadingWave(true);
      setPercentDone(0);
      await useMapsOffline.doUnzip();
    }
    catch (err) {
      console.error('Unzip Error:', err);
    }
  };

  const downloadZip = async (zipUID) => {
    try {
      const downloadZipURL = STRABO_APIS.TILE_HOST + '/ziptemp/' + zipUID + '/' + zipUID + '.zip';
      const downloadOptions = {
        fromUrl: downloadZipURL,
        toFile: APP_DIRECTORIES.TILE_ZIP + zipUID + '.zip',
        begin: (response) => {
          const jobId = response.jobId;
          setShowLoadingBar(true);
          setIsLoadingWave(false);
          dispatch(removedLastStatusMessage());
          dispatch(addedStatusMessage('Downloading...'));
          console.log('DOWNLOAD HAS BEGUN! JobId: ' + jobId);
        },
        progress: (res) => {
          console.log('Download Zip Progress', ((res.bytesWritten / res.contentLength) * 100).toFixed(2));
          setPercentDone(res.bytesWritten / res.contentLength);
        },
        discretionary: true,
      };

      //first try to delete from temp directories
      await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.TILE_ZIP);
      await useDevice.doesDeviceDirectoryExist(APP_DIRECTORIES.TILE_TEMP);
      await useMapsOffline.checkTileZipFileExistance();
      const res = await useServerRequests.timeoutPromise(60000, RNFS.downloadFile(downloadOptions).promise);
      if (res.statusCode === 200) {
        console.log(res);
      }
      else {
        console.error('Server Error');
        throw new Error('Error downloading tiles from ' + downloadOptions.fromUrl);
      }
    }
    catch (err) {
      console.error('Server error in downloadZipUrl', err);
      throw Error(err);
    }
  };

  const saveMap = async () => {
    try {
      setShowMainMenu(false);
      setShowLoadingMenu(true);
      setShowLoadingBar(true);
      setIsLoadingWave(true);
      setIsLoadingCircle(false);
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Gathering Tiles...'));
      const zipId = await useMapsOffline.initializeSaveMap(extentString, downloadZoom);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Preparing Data...'));
      await checkZipStatus(zipId);
      setShowLoadingBar(false);
      dispatch(removedLastStatusMessage());
      dispatch(addedStatusMessage('Data ready to download.'));
      await downloadZip(zipId);
      await delay(1000);
      await doUnzip(zipId);
      const tileArray = await useMapsOffline.moveFiles(zipId);
      await tileMove(tileArray, zipId);
      await useMapsOffline.updateMapTileCount();
      console.log('Saved offlineMaps to Redux.');
      setShowMainMenu(false);
      setShowLoadingMenu(false);
      setShowLoadingBar(false);
      setShowComplete(true);
    }
    catch (err) {
      console.error('Error saving map', err);
      const editedError = err.toString().replace('Error: Error: Error:', '');
      setIsError(true);
      setErrorMessage(editedError);
      setShowMainMenu(false);
      setShowLoadingMenu(false);
      setShowLoadingBar(false);
      setIsLoadingCircle(false);
    }
  };

  const tileMove = async (tilearray) => {
    setIsLoadingWave(false);
    dispatch(removedLastStatusMessage());
    dispatch(addedStatusMessage('Installing tiles...'));
    for (const tile of tilearray) {
      const progress = await useMapsOffline.moveTile(tile);
      setPercentDone(progress[0] / tilearray.length);
      setInstalledTiles(progress[2]);
      setTilesToInstall(progress[1]);
    }
  };

  const updateCount = async () => {
    getTileCount(downloadZoom).then((tileCount) => {
      if (tileCount.count) {
        console.log('downloadZoom from updateCount: ', downloadZoom);
        console.log('downloadZoom tileCount: ', tileCount.count);
        setTileCount(tileCount.count);
        setIsLoadingCircle(false);
        console.log('return_from_mapview_getTileCount: ', tileCount.count);
      }
      else if (tileCount.message) {
        setShowMainMenu(false);
        if (tileCount.message.includes('Invalid extent')) {
          console.error(tileCount.message);
          setErrorMessage('\n\nPlease zoom to level 5 or greater to get a more accurate tiles with features.');
        }
        setIsError(true);
        setIsLoadingCircle(false);
      }
    });
  };

  const updatePicker = async (zoomValue) => {
    await setDownloadZoom(zoomValue);
  };

  return (
    <Dialog
      dialogTitle={
        <View style={styles.dialogTitleContainer}>
          <View style={styles.dialogTitle}>
            <Text style={{fontSize: 25}}>{currentMapName}</Text>
          </View>
          <View style={styles.closeButton}>
            <Button
              title={'Close'}
              titleStyle={{fontSize: themes.MEDIUM_TEXT_SIZE}}
              type={'clear'}
              onPress={() => dispatch(setOfflineMapsModalVisible(false))}
            />
          </View>
        </View>
      }
      onDismiss={() => {
        setShowMainMenu(true);
        setShowComplete(false);
      }}
      height={Platform.OS === 'ios' ? 400 : 325}
      visible={isOfflineMapModalVisible}
      dialogStyle={commonStyles.dialogBox}
      dialogAnimation={new SlideAnimation({
        slideFrom: 'top',
      })}
    >
      <DialogContent style={commonStyles.dialogContent}>
        <View style={styles.saveModalContainer}>
          {showMainMenu && (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text>
                Select max zoom level to download:
              </Text>
            </View>
          )}
          <View style={{flex: 3, justifyContent: 'center', alignItems: 'center'}}>
            {showMainMenu && (
              <Picker
                mode={'dropdown'}
                prompt={'Select a zoom level'}
                onValueChange={value => updatePicker(value)}
                selectedValue={downloadZoom}
                style={Platform.OS === 'ios' ? styles.pickerIOS : styles.pickerAndroid}
              >
                {zoomLevels.map((zoom) => {
                  return (
                    <Picker.Item
                      style={{width: 100}}
                      key={zoom}
                      value={zoom}
                      label={zoom.toString()}
                    />
                  );
                })}
              </Picker>
            )}
            {showLoadingBar && (
              <View style={{height: 40, alignItems: 'center'}}>
                {isLoadingWave
                  ? (
                    <View style={{paddingBottom: 35}}>
                      <ActivityIndicator size={'large'} color={themes.BLACK}/>
                    </View>
                  ) : (
                    <View>
                      <ProgressBar progress={percentDone} width={200}/>
                      <Text style={{textAlign: 'right', paddingTop: 5}}>
                        {toNumberFixedValue(percentDone, 0)}
                      </Text>
                    </View>
                  )
                }
              </View>
            )}
            {showLoadingMenu && (
              <View style={commonStyles.alignItemsCenter}>
                <Text style={{fontSize: 15}}>{statusMessages}</Text>
                {statusMessages.includes('Installing tiles...') && !statusMessages.includes(
                  'Downloading Tiles...') && (
                  <View style={commonStyles.alignItemsCenter}>
                    <Text style={{fontSize: 15}}>Installing: {tilesToInstall}</Text>
                    <Text style={{fontSize: 15}}>Already Installed: {installedTiles}</Text>
                  </View>
                )}
              </View>
            )}
            {isError && (
              <View style={commonStyles.alignItemsCenter}>
                <Text style={{fontSize: 20, textAlign: 'center'}}>Something Went Wrong!</Text>
                <Text style={{fontSize: 20, paddingTop: 30, textAlign: 'center'}}>{errorMessage}</Text>
              </View>
            )}
            {showComplete && (
              <View style={commonStyles.alignItemsCenter}>
                <Text style={{fontSize: 20, padding: 10}}>Success!</Text>
              </View>
            )}
            {showComplete && (
              <View style={commonStyles.alignItemsCenter}>
                <Text>Your map has been successfully downloaded to this device.</Text>
              </View>
            )}
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            {showMainMenu && (
              <View>
                {isLoadingCircle
                  ? <ActivityIndicator size={'large'} color={themes.BLACK}/>
                  : (
                    <Button
                      onPress={() => saveMap()}
                      type={'clear'}
                      title={`Download ${tileCount} Tiles`}
                    />
                  )}
              </View>
            )
            }
            {isError && (
              <Button
                onPress={() => dispatch(setOfflineMapsModalVisible(false))}
                type={'clear'}
                buttonStyle={styles.button}
                title={'Close'}
              />
            )}
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
};

export default SaveMapsModal;
