import React, {useEffect, useState} from 'react';
import {Alert, Text, View, Platform} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import RNFS from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../../services/useDevice';
import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import {setOfflineMapsModalVisible} from '../../home/home.slice';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import {setOfflineMap} from '../offline-maps/offlineMaps.slice';
import styles from './offlineMaps.styles';
import useMapsOfflineHook from './useMapsOffline';

const ManageOfflineMaps = (props) => {
  console.log('Props: ', props);

  const [directoryExists, setDirectoryExists] = useState(false);
  const [availableMaps, setAvailableMaps] = useState({});
  const [loading, setLoading] = useState(true);

  const devicePath = RNFS.DocumentDirectoryPath;
  const tilesDirectory = devicePath + '/StraboSpotTiles';
  const tileCacheDirectory = tilesDirectory + '/TileCache';
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);
  const isOnline = useSelector(state => state.home.isOnline);
  const mainMenuPageVisible = useSelector(state => state.mainMenu.mainMenuPageVisible);
  const dispatch = useDispatch();

  const useDevice = useDeviceHook();
  const useMapsOffline = useMapsOfflineHook();

  useEffect(() => {
    readDirectoryForMaps().catch(err => console.log(err));
  }, [mainMenuPageVisible]);

  useEffect(() => {
    console.log('Offline Maps Updated:', offlineMaps);
    setAvailableMaps(offlineMaps)
  }, [offlineMaps])

  useEffect(() => {
    console.log('Is Online: ', isOnline);
  }, [isOnline]);

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
          onPress: () => {
            delete availableMaps[map.id];
            useDevice.deleteOfflineMap(map);
          },
        },
      ],
      {cancelable: false},
    );
  };

  const readDirectoryForMaps = async () => {
    try {
      const files = await useDevice.readDirectoryForMaps()
      setDirectoryExists(true);
      const availableMapObj = Object.assign({}, ...files.map(file => ({[offlineMaps[file].id]: offlineMaps[file]})));
      setAvailableMaps({...availableMaps, ...availableMapObj});
      setLoading(false);
    }
    catch (err) {
      console.error('Error reading directory for maps', err);
      setLoading(false);
    }
  };

  const renderMapsList = () => {
    return (
      <View>
        {!isEmpty(availableMaps) && directoryExists && !loading ? (
          Object.values(availableMaps).map((item, i) => (
            <ListItem
              containerStyle={styles.list}
              bottomDivider={i < Object.values(availableMaps).length - 1}
              key={item.id}
            >
              <ListItem.Content>
                <View style={styles.itemContainer}>
                  <ListItem.Title style={styles.itemTextStyle}>{`${item.name} (${item.count} tiles)`}</ListItem.Title>
                </View>
                <View style={styles.itemSubContainer}>
                  <Button
                    onPress={() => useMapsOffline.setOfflineMapTiles(item)}
                    disabled={isOnline}
                    titleStyle={styles.buttonText}
                    type={'clear'}
                    title={'View in map offline'}
                  />
                  <Button
                    onPress={() => confirmDeleteMap(item)}
                    titleStyle={styles.buttonText}
                    type={'clear'}
                    title={'Delete!!'}
                  />
                </View>
              </ListItem.Content>
            </ListItem>
          ))
        ) : (
          <View style={{alignItems: 'center', paddingTop: 30}}>
            <Text>No Offline Maps:</Text>
            <Text style={{textAlign: 'center', padding: 15}}>
              To download a map select area and zoom level on map then select "Download tiles of current map"
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <React.Fragment>
      <Button
        title={'Download tiles of current map'}
        disabled={!isOnline}
        onPress={() => dispatch(setOfflineMapsModalVisible(true))}
        containerStyle={styles.buttonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
      />
      <Divider sectionText={'offline maps'} style={styles.divider}/>
      {loading ? <Text style={{textAlign: 'center', padding: 15}}>Loading...</Text> : renderMapsList()}
    </React.Fragment>
  );
};

export default ManageOfflineMaps;
