import React, {useEffect, useState} from 'react';
import {Alert, Text, View, FlatList} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../../services/useDevice';
import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../../shared/ui/ListEmptyText';
import SectionDivider from '../../../shared/ui/SectionDivider';
import {setOfflineMapsModalVisible} from '../../home/home.slice';
import {setOfflineMap} from './offlineMaps.slice';
import styles from './offlineMaps.styles';
import useMapsOfflineHook from './useMapsOffline';

const ManageOfflineMaps = (props) => {
  const [availableMaps, setAvailableMaps] = useState({});
  const [loading, setLoading] = useState(false);

  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);
  const isOnline = useSelector(state => state.home.isOnline);
  const mainMenuPageVisible = useSelector(state => state.mainMenu.mainMenuPageVisible);
  const dispatch = useDispatch();

  const useDevice = useDeviceHook();
  const useMapsOffline = useMapsOfflineHook();

  useEffect(() => {
    if (!isEmpty(offlineMaps)) readDirectoryForMaps().catch(err => console.log(err));
  }, [mainMenuPageVisible]);

  useEffect(() => {
    console.log('Offline Maps Updated:', offlineMaps);
    setAvailableMaps(offlineMaps);
  }, [offlineMaps]);

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
            Object.values(availableMaps).filter(mapId => mapId.id !== map.id);
            useDevice.deleteOfflineMap(map);
          },
        },
      ],
      {cancelable: false},
    );
  };

  const readDirectoryForMaps = async () => {
    try {
      setLoading(true);
      const ids = await useDevice.readDirectoryForMaps();
      setDirectoryExists(true);
        const availableMapObj = Object.assign({}, ...ids.map(id => ({[offlineMaps[id].id]: offlineMaps[id]})));
        setAvailableMaps({...availableMaps, ...availableMapObj});
        setLoading(false);
    }
    catch (err) {
      console.error('Error reading directory for maps', err);
      dispatch(setOfflineMap({}));
      setLoading(false);
    }
  };

  const renderMapsList = () => {
    return (
      <FlatList
        keyExtractor={(item) => item.id}
        data={Object.values(availableMaps)}
        renderItem={({item}) => renderMapsListItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No Offline Maps. To download a map select area and zoom'
        + ' level on map then select "Download tiles of current map"'}/>}
      />
    );
  };

  const renderMapsListItem = (item) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={item.id}
      >
        <ListItem.Content>
          <View style={styles.itemContainer}>
            <ListItem.Title style={styles.itemTextStyle}>{`${item.name}`}</ListItem.Title>
            <ListItem.Title style={styles.itemSubTextStyle}>{`(${item.count} tiles)`}</ListItem.Title>
          </View>
          <View style={styles.itemSubContainer}>
            <Button
              onPress={async () => {
                await useMapsOffline.switchToOfflineMap(item.id);
                props.zoomToCenterOfflineTile();
              }}
              titleStyle={commonStyles.viewMapsButtonText}
              type={'clear'}
              title={'View in map offline'}
            />
            <Button
              onPress={() => confirmDeleteMap(item)}
              titleStyle={commonStyles.viewMapsButtonText}
              type={'clear'}
              title={'Delete'}
            />
          </View>
        </ListItem.Content>
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      <Button
        title={'Download tiles of current map'}
        disabled={!isOnline}
        onPress={() => {
          props.closeMainMenuPanel();
          dispatch(setOfflineMapsModalVisible(true));
        }}
        containerStyle={styles.buttonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
      />
      <SectionDivider dividerText={'Offline Maps'}/>
      {loading ? <Text style={{textAlign: 'center', padding: 15}}>Loading...</Text> : renderMapsList()}
    </React.Fragment>
  );
};

export default ManageOfflineMaps;
