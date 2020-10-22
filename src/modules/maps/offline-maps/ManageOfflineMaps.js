import React from 'react';
import {Alert, Text, View, Platform} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import {setOfflineMapsModalVisible} from '../../home/home.slice';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import {mapReducers} from '../maps.constants';
import styles from './offlineMaps.styles';

var RNFS = require('react-native-fs');

const ManageOfflineMaps = (props) => {
  console.log('Props: ', props);

  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const tilesDirectory = '/StraboSpotTiles';
  const tileCacheDirectory = devicePath + tilesDirectory + '/TileCache';
  const zipsDirectory = devicePath + tilesDirectory + '/TileZips';
  const tileTempDirectory = devicePath + tilesDirectory + '/TileTemp';
  const isOnline = useSelector(state => state.home.isOnline);
  const dispatch = useDispatch();

  console.log('tileCacheDirectory: ', tileCacheDirectory);

  const viewOfflineMap = async (map) => {
    let tempCurrentBasemap;
    console.log('viewOfflineMap: ', map);

    // let tileJSON = 'file://' + tileCacheDirectory + '/' + map.id + '/tiles/{z}_{x}_{y}.png';
    const url = 'file://' + tileCacheDirectory + '/';
    const tilePath = '/tiles/{z}_{x}_{y}.png';

    tempCurrentBasemap = {...map, url: [url], tilePath: tilePath};
    console.log('tempCurrentBasemap: ', tempCurrentBasemap);
    await props.onCurrentBasemap(tempCurrentBasemap);
    // props.closeSettingsDrawer();
  };

  const confirmDeleteMap = async (map) => {
    console.log(map);
    Alert.alert(
      'Delete Offline Map',
      'Are you sure you want to delete ' + map.name + '?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => deleteOfflineMap(map),
        },
      ],
      {cancelable: false},
    );
  };

  const deleteOfflineMap = async (map) => {
    console.log('Deleting Map Here');
    console.log('map: ', map.id);
    // console.log('directory: ', tileCacheDirectory + '/' + map.id);
    const mapId = map.id === 'mapwarper' ? map.name : map.id;
    let folderExists = await RNFS.exists(tileCacheDirectory + '/' + mapId);
    const zipFileExists = await RNFS.exists(
      zipsDirectory + '/' + map.mapId + '.zip',
    );
    const tileTempFileExists = await RNFS.exists(
      tileTempDirectory + '/' + map.mapId,
    );
    console.log(folderExists, zipFileExists, tileTempFileExists);
    //first, delete folder with tiles
    if (folderExists || zipFileExists || tileTempFileExists) {
      await RNFS.unlink(tileCacheDirectory + '/' + mapId);
      if (zipFileExists) {
        await RNFS.unlink(zipsDirectory + '/' + map.mapId + '.zip');
      }
      if (tileTempFileExists) {
        await RNFS.unlink(tileTempDirectory + '/' + map.mapId);
      }
    }

    //now, delete map from Redux
    let keyToDelete;
    let currentOfflineMaps = props.offlineMaps;
    Object.entries(currentOfflineMaps).forEach(([key, value]) => {
      if (value.mapId === map.mapId) keyToDelete = key;
    });

    // console.log(keyToDelete);
    delete currentOfflineMaps[keyToDelete];
    // console.log(currentOfflineMaps);

    await props.onOfflineMaps(currentOfflineMaps);
    // console.log('Saved offlineMaps to Redux.');
  };

  return (
    <React.Fragment>
      <Button
        title={'Download tiles of current map'}
        onPress={() => dispatch(setOfflineMapsModalVisible(true))}
        containerStyle={styles.buttonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
      />
      <Divider sectionText={'offline maps'} style={styles.divider}/>
      <View style={styles.sectionsContainer}>
        {!isEmpty(props.offlineMaps) ? (
          Object.values(props.offlineMaps).map((item, i) => (
            <ListItem
              containerStyle={styles.list}
              bottomDivider={i < Object.values(props.offlineMaps).length - 1}
              key={item.id}
            >
              <ListItem.Content>
                <View style={styles.itemContainer}>
                  <ListItem.Title style={styles.itemTextStyle}>{`${item.name} (${item.count} tiles)`}</ListItem.Title>
                </View>
                <View style={styles.itemSubContainer}>
                  {!isOnline && <Button
                    onPress={() => viewOfflineMap(item)}
                    titleStyle={styles.buttonText}
                    type={'clear'}
                    title={'View in map'}
                  />}
                  <Button
                    onPress={() => confirmDeleteMap(item)}
                    titleStyle={styles.buttonText}
                    type={'clear'}
                    title={'Delete'}
                  />
                </View>
              </ListItem.Content>
            </ListItem>
          ))
        ) : (
          <View style={{alignItems: 'center', paddingTop: 20}}>
            <Text>No Offline Maps</Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    offlineMaps: state.map.offlineMaps,
    currentBasemap: state.map.currentBasemap,
  };
};

const mapDispatchToProps = {
  onOfflineMaps: (offlineMaps) => ({
    type: mapReducers.OFFLINE_MAPS,
    offlineMaps: offlineMaps,
  }),
  onCurrentBasemap: (basemap) => ({
    type: mapReducers.CURRENT_BASEMAP,
    basemap: basemap,
  }),
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageOfflineMaps);
