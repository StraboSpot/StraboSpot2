import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Picker} from '@react-native-community/picker';
import {Button, Header} from 'react-native-elements';
import RNFS from 'react-native-fs';
import * as loading from 'react-native-indicators';
import {Dialog, DialogContent, SlideAnimation} from 'react-native-popup-dialog';
import ProgressBar from 'react-native-progress/Bar';
import {unzip} from 'react-native-zip-archive'; /*TODO  react-native-zip-archive@3.0.1 requires a peer of react@^15.4.2 || <= 16.3.1 but none is installed */
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../../services/useDevice';
import {toNumberFixedValue} from '../../../shared/Helpers';
import * as themes from '../../../shared/styles.constants';
import {addedStatusMessage, clearedStatusMessages, removedLastStatusMessage} from '../../home/home.slice';
import useMapsOfflineHook from './useMapsOffline';

const SaveMapsModal = (props) => {
  const useDevice = useDeviceHook();
  const useMapsOffline = useMapsOfflineHook();

  const tilehost = 'http://tiles.strabospot.org';
  const devicePath = RNFS.DocumentDirectoryPath;
  let tilesDirectory = '/StraboSpotTiles';
  let tileZipsDirectory = devicePath + tilesDirectory + '/TileZips';
  let tileTempDirectory = devicePath + tilesDirectory + '/TileTemp';

  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const statusMessage = useSelector(state => state.home.statusMessages);
  const dispatch = useDispatch();

  const currentMapName = currentBasemap && currentBasemap.title;
  const maxZoom = currentBasemap && currentBasemap.maxZoom;
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
  const [percentDone, setPercentDone] = useState(0);
  const [downloadZoom, setDownloadZoom] = useState(0);
  const [zoomLevels, setZoomLevels] = useState([]);
  const [extentString, setExtentString] = useState('');

  useEffect(() => {
    return function cleanUp() {
      setInstalledTiles(0);
      setTilesToInstall(0);
      setPercentDone(0);
    };
  }, []);

  useEffect(() => {
    if (props.map) {
      props.map.getCurrentZoom().then((zoom) => {
        let initialZoom = [];
        let currentZoom = Math.round(zoom);
        setDownloadZoom(Math.round(zoom));

        const numZoomLevels = maxZoom ? Math.min(maxZoom - currentZoom + 1, 6) : 5;

        for (let i = 0; i < numZoomLevels; i++) {
          initialZoom.push(currentZoom + i);
        }
        setZoomLevels(initialZoom);
      });

      props.map.getExtentString().then(ex => {
        setExtentString(ex);
      });
    }
  }, [props.map]);

  useEffect(() => {
    console.log('downloadZoom in UE', downloadZoom);
    console.log('extentString is UE', extentString);
    if (downloadZoom > 0) {
      updateCount().then(() => {
        console.log('TileCount', tileCount);

      });
    }
  }, [downloadZoom]);

  useEffect(() => {
    console.log('progressStatus', progressStatus);
  }, [progressStatus]);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const doUnzip = async () => {
    try {
      // hide progress bar
      // setShowLoadingBar(false);
      setPercentDone(0);
      await useMapsOffline.doUnzip();
    }
    catch (err) {
      console.error('Unzip Error:', err);
    }
  };

  const downloadZip = async (zipUID) => {
    try {
      const downloadZipURL = tilehost + '/ziptemp/' + zipUID + '/' + zipUID + '.zip';
      const downloadOptions = {
        fromUrl: downloadZipURL,
        toFile: tileZipsDirectory + '/' + zipUID + '.zip',
        begin: (response) => {
          const jobId = response.jobId;
          console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
        },
        progress: (res) => {
          console.log(((res.bytesWritten / res.contentLength) * 100).toFixed(2));
          setPercentDone(res.bytesWritten / res.contentLength);
        },
      };

      //first try to delete from temp directories
      await useDevice.doesDeviceDirectoryExist(tileZipsDirectory);
      await useDevice.doesDeviceDirectoryExist(tileTempDirectory);
      await useMapsOffline.checkTileZipFileExistance();
      const res = await RNFS.downloadFile(downloadOptions).promise;
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
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Gathering Tiles...'));
      const zipId = await useMapsOffline.initializeSaveMap(extentString, downloadZoom);
      setIsLoadingWave(false);
      await downloadZip(zipId);
      await delay(1000);
      await doUnzip(zipId);
      const tileArray = await useMapsOffline.moveFiles(zipId);
      console.log(tileArray);
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
      setIsError(true);
      setErrorMessage(err);
      setShowMainMenu(false);
      setShowLoadingMenu(false);
      setShowLoadingBar(false);
    }
  };

  const tileMove = async (tilearray) => {
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
    props.map.getTileCount(downloadZoom).then((tileCount) => {
      console.log('downloadZoom from updateCount: ', downloadZoom);
      setTileCount(tileCount);
      console.log('return_from_mapview_getTileCount: ', tileCount);
    });
  };

  const updatePicker = async (zoomValue) => {
    await setDownloadZoom(zoomValue);
  };

  return (
    <Dialog
      onDismiss={() => {
        setShowMainMenu(true);
        setShowComplete(false);
      }}
      visible={props.visible}
      dialogStyle={{borderRadius: 30}}
      dialogAnimation={new SlideAnimation({
        slideFrom: 'top',
      })}
    >
      <DialogContent style={{height: 410}}>
        <View style={styles.modalContainer}>
          <Header
            backgroundColor={themes.PRIMARY_BACKGROUND_COLOR}
            containerStyle={{width: 400}}
            centerComponent={
              <View>
                <View style={{justifyContent: 'center'}}>
                  <Text style={{fontSize: 30}}>{currentMapName}</Text>
                </View>
              </View>
            }
          />
          <View style={{flex: 1}}>
            <View style={{flex: 1}}>
              {showMainMenu && (
                <View style={{paddingTop: 20, paddingBottom: 20}}>
                  <Text style={{textAlign: 'center'}}>
                    Select max zoom level to download:
                  </Text>
                </View>
              )}
            </View>
            <View style={{flex: 3}}>
              {showMainMenu && (
                <Picker
                  onValueChange={(value) => updatePicker(value)}
                  selectedValue={downloadZoom}
                  style={styles.picker}
                >
                  {zoomLevels.map(i => {
                    return (
                      <Picker.Item
                        key={i}
                        value={i}
                        label={i.toString()}
                      />
                    );
                  })}
                </Picker>
              )}
              {showLoadingBar && (
                <View style={{height: 40, justifyContent: 'center', flexDirection: 'row'}}>
                  {isLoadingWave
                    ? (
                      <View style={{paddingBottom: 35}}>
                        <loading.DotIndicator animating={isLoadingWave} count={6} size={10}/>
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
                <View style={{height: 40, justifyContent: 'center'}}>
                  <Text style={{fontSize: 15}}>{statusMessage}</Text>
                  {statusMessage.includes('Installing tiles...') && !statusMessage.includes('Downloading Tiles...') && (
                    <View>
                      <Text style={{fontSize: 15}}>Installing: {tilesToInstall}</Text>
                      <Text style={{fontSize: 15}}>Already Installed: {installedTiles}</Text>
                    </View>
                  )}
                </View>
              )}
              {isError && (
                <View style={{height: 40, justifyContent: 'center'}}>
                  <Text style={{fontSize: 20}}>Something Went Wrong!</Text>
                </View>
              )}
              {showComplete && (
                <View style={{height: 40, justifyContent: 'center'}}>
                  <Text style={{fontSize: 20}}>Success!</Text>
                </View>
              )}
              {showComplete && (
                <View style={{height: 40, justifyContent: 'center'}}>
                  <Text>Your map has been successfully downloaded to this device.</Text>
                </View>
              )}
            </View>
            <View style={{flex: 2}}>
              {showMainMenu && (
                <View>
                  <Button
                    onPress={() => saveMap()}
                    type={'clear'}
                    containerStyle={{marginTop: 15}}
                    // buttonStyle={{borderRadius: 30, paddingRight: 50, paddingLeft: 50}}
                    title={`Download ${tileCount} Tiles`}
                  />
                  <Button
                    title={'Close'}
                    type={'clear'}
                    containerStyle={{marginTop: 15}}
                    onPress={props.close}
                  />
                </View>
              )}
              {showComplete && (
                <Button
                  onPress={props.close}
                  type={'clear'}
                  buttonStyle={{borderRadius: 30, paddingRight: 50, paddingLeft: 50}}
                  title={'Continue'}
                />
              )}
              {isError && (
                <Button
                  onPress={props.close}
                  type={'clear'}
                  buttonStyle={{borderRadius: 30, paddingRight: 50, paddingLeft: 50}}
                  title={'Close'}
                />
              )}
            </View>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    width: 300,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    paddingLeft: 10,
    paddingRight: 15,
  },
  picker: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default SaveMapsModal;
