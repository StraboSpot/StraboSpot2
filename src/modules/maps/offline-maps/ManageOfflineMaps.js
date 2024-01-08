import React, {useEffect, useMemo, useState} from 'react';
import { Animated, FlatList, Text, View} from 'react-native';

import {Button, Icon, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {editedOfflineMap, setOfflineMapVisible} from './offlineMaps.slice';
import styles from './offlineMaps.styles';
import useMapsOfflineHook from './useMapsOffline';
import useDeviceHook from '../../../services/useDevice';
import commonStyles from '../../../shared/common.styles';
import {isEmpty, truncateText} from '../../../shared/Helpers';
import alert from '../../../shared/ui/alert';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import TextInputModal from '../../../shared/ui/GeneralTextInputModal';
import ListEmptyText from '../../../shared/ui/ListEmptyText';
import SectionDivider from '../../../shared/ui/SectionDivider';
import {setOfflineMapsModalVisible} from '../../home/home.slice';
import {WarningModal} from '../../home/modals';
import useMapsHook from '../useMaps';

const ManageOfflineMaps = ({closeMainMenuPanel}) => {
  console.log('Rendering ManageOfflineMaps...');

  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);
  const isOnline = useSelector(state => state.connections.isOnline);
  const mainMenuPageVisible = useSelector(state => state.mainMenu.mainMenuPageVisible);
  const dispatch = useDispatch();

  const animatedPulse = useMemo(() => new Animated.Value(1), []);
  const [availableMaps, setAvailableMaps] = useState({});
  const [loading, setLoading] = useState(false);
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
  const [selectedMap, setSelectedMap] = useState({});

  const useDevice = useDeviceHook();
  const useMaps = useMapsHook();
  const useMapsOffline = useMapsOfflineHook();

  useEffect(() => {
    console.log('UE ManageOfflineMaps [mainMenuPageVisible]', mainMenuPageVisible);
    setLoading(true);
    useMapsOffline.getSavedMapsFromDevice().then(r => console.log(`Got maps from device: ${r}`));
    setLoading(false);
  }, []);

  useEffect(() => {
    Animated.sequence([
      // increase size
      Animated.timing(animatedPulse, {
        useNativeDriver: true,
        toValue: 2,
        duration: 750,
      }),
      // decrease size
      Animated.timing(animatedPulse, {
        useNativeDriver: true,
        toValue: 1,
        duration: 500,
      }),
    ]).start();
  }, [animatedPulse]);

  useEffect(() => {
    console.log('UE ManageOfflineMaps [offlineMaps]', offlineMaps);
    setAvailableMaps(offlineMaps);
  }, [offlineMaps]);

  const confirmDeleteMap = async (map) => {
    console.log(map);
    alert(
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

  const editMap = (map) => {
    setSelectedMap(map);
    setIsNameModalVisible(true);
  };

  const getTitle = (map) => {
    let name = map.name;
    if (!map.name) {
      return map.id;
    }
    else return name;
  };

  const renderNameChangeModal = () => {
    return (
      <View style={{backgroundColor: 'red', alignContent: 'flex-start'}}>
        <TextInputModal
          dialogTitle={'Edit Map Name'}
          placeholder={selectedMap.name}
          style={styles.dialogTitle}
          visible={isNameModalVisible}
          onPress={() => saveMapEdits()}
          closeModal={() => setIsNameModalVisible(false)}
          value={selectedMap.name}
          onChangeText={text => setSelectedMap({...selectedMap, name: text})}
        />
      </View>
    );
  };

  const renderMapsList = () => {
    return (
      <FlatList
        keyExtractor={item => item.id}
        data={Object.values(offlineMaps)}
        renderItem={({item}) => renderMapsListItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No Offline Maps. To download a map select area and zoom'
          + ' level on map then select "Download tiles of current map"'}/>}
      />
    );
  };

  const renderMapEditModal = (map) => {
    if (map.id !== 'mapbox.outdoors' && map.id !== 'mapbox.satellite' && map.id !== 'osm' && map.id !== 'macrostrat') {
      return (
        <Button
          onPress={() => editMap(map)}
          titleStyle={commonStyles.viewMapsButtonText}
          type={'clear'}
          title={'Edit'}
        />
      );
    }
  };

  const renderMapsListItem = (item) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItemFormField}
        key={item.id}
      >
        <ListItem.Content>
          <View style={styles.itemContainer}>
            <ListItem.Title style={commonStyles.listItemTitle}>
              {`${!isEmpty(item) ? truncateText(getTitle(item), 20) : 'No Name'}`}
            </ListItem.Title>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {item.count === 0 && (
                <Animated.View style={{transform: [{scale: animatedPulse}]}}>
                  <Icon
                    containerStyle={{margin: 5}}
                    name={'alert'}
                    type={'material-community'}
                    size={17}
                    color={'red'}
                  />
                </Animated.View>
              )}
              <ListItem.Title style={styles.itemSubTextStyle}>{`(${item.count} tiles)`}</ListItem.Title>
            </View>
          </View>
          <View style={styles.itemSubContainer}>
            {isOnline.isInternetReachable && (
              <Button
                onPress={() => toggleOfflineMap(item)}
                disabled={item.count === 0}
                titleStyle={commonStyles.viewMapsButtonText}
                type={'clear'}
                title={item.isOfflineMapVisible ? 'Stop viewing offline maps' : item.count === 0 ? 'No tiles to view' : 'View offline map'}
              />
            )}
            <View style={{flexDirection: 'row', padding: 0}}>
              <Button
                onPress={() => confirmDeleteMap(item)}
                titleStyle={commonStyles.viewMapsButtonText}
                type={'clear'}
                title={'Delete'}
              />
              {renderMapEditModal(item)}
            </View>
          </View>
        </ListItem.Content>
      </ListItem>
    );
  };

  const renderWarningModal = () => {

    return (
      <WarningModal
        title={'Map Not Available!'}
        isVisible={isWarningModalVisible}
      >
        <Text>Selected map is not available for offline use. Switching to first available map: {selectedMap.name}</Text>
      </WarningModal>
    );
  };

  const saveMapEdits = () => {
    console.log('Map name saved!', selectedMap.name);
    dispatch(editedOfflineMap(selectedMap));
    setIsNameModalVisible(false);
  };

  const toggleOfflineMap = async (item) => {
    if (item.isOfflineMapVisible) {
      dispatch(setOfflineMapVisible({mapId: item.id, viewable: false}));
      await useMaps.setBasemap(item.id);
    }
    else {
      dispatch(setOfflineMapVisible({mapId: item.id, viewable: true}));
      const res = await useMapsOffline.switchToOfflineMap(item.id);
      if (!isEmpty(res)) {
        setSelectedMap(res);
        setIsWarningModalVisible(true);
      }
      else props.zoomToCenterOfflineTile();
    }
  };

  return (
    <React.Fragment>
      <Button
        title={'Download tiles of current map'}
        disabled={(!isOnline.isInternetReachable && !isOnline.isConnected)
          || Object.values(offlineMaps).some(map => map.isOfflineMapVisible === true)}
        onPress={() => {
          closeMainMenuPanel();
          dispatch(setOfflineMapsModalVisible(true));
        }}
        containerStyle={styles.buttonContainer}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
      />
      <SectionDivider dividerText={'Offline Maps'}/>
      {loading ? <Text style={{textAlign: 'center', padding: 15}}>Loading...</Text> : renderMapsList()}
      {renderNameChangeModal()}
      {renderWarningModal()}
    </React.Fragment>
  );
};

export default ManageOfflineMaps;
