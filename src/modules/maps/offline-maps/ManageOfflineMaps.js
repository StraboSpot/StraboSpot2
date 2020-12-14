import React, {useEffect} from 'react';
import {Alert, Text, View, Platform} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import RNFS from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../../services/useDevice';
import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import {setOfflineMapsModalVisible} from '../../home/home.slice';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import styles from './offlineMaps.styles';
import useMapsOfflineHook from './useMapsOffline';

const ManageOfflineMaps = (props) => {
  console.log('Props: ', props);

  const devicePath = RNFS.DocumentDirectoryPath;
  const tilesDirectory = '/StraboSpotTiles';
  const tileCacheDirectory = devicePath + tilesDirectory + '/TileCache';
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);
  const isOnline = useSelector(state => state.home.isOnline);
  const dispatch = useDispatch();

  const useDevice = useDeviceHook();
  const useMapsOffline = useMapsOfflineHook();

  console.log('tileCacheDirectory: ', tileCacheDirectory);

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
          onPress: () => useDevice.deleteOfflineMap(map),
        },
      ],
      {cancelable: false},
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
      <View style={styles.sectionsContainer}>
        {!isEmpty(offlineMaps) ? (
          Object.values(offlineMaps).map((item, i) => (
            <ListItem
              containerStyle={styles.list}
              bottomDivider={i < Object.values(offlineMaps).length - 1}
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
          <View style={{alignItems: 'center', paddingTop: 20}}>
            <Text>No Offline Maps</Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default ManageOfflineMaps;
