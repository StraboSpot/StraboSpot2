import React from 'react';
import {FlatList, Switch, Text, View} from 'react-native';

import {Icon, ListItem, Overlay} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {truncateText} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import {BASEMAPS} from '../maps/maps.constants';
import useMapsOfflineHook from '../maps/offline-maps/useMapsOffline';
import useMapsHook from '../maps/useMaps';
import styles from './dialog.styles';
import homeStyles from './home.style';

const BaseMapDialog = (props) => {

  const [useMaps] = useMapsHook();
  const useMapsOffline = useMapsOfflineHook();

  const customMaps = useSelector(state => state.map.customMaps);
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const isOnline = useSelector(state => state.home.isOnline);
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);

  // const conditions = ['http', 'https'];
  //
  // const checkForOfflineCustomMaps = () => {
  //   return Object.values(offlineMaps).some(map => {
  //     return map.source === 'map_warper' || map.source === 'strabospot_mymaps';
  //   });
  // };
  //
  // const checkMapOverlay = () => {
  //   return Object.values(customMaps).some(map => map.overlay === false);
  // };

  const renderDefaultBasemapsList = () => {
    let sectionTitle = 'Default Basemaps';
    let mapsToDisplay = BASEMAPS;
    if (!isOnline.isInternetReachable) {
      mapsToDisplay = Object.values(offlineMaps).reduce((acc, offlineMap) => {
        return offlineMap.source === 'strabo_spot_mapbox' || offlineMap.id === 'mapbox.outdoors'
        || offlineMap.id === 'mapbox.satellite' || offlineMap.id === 'osm' || offlineMap.id === 'macrostrat'
          ? [...acc, offlineMap]
          : acc;
      }, []);
      sectionTitle = 'Offline Default Basemaps';
    }
    return (
      <View>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id}
          data={mapsToDisplay}
          renderItem={({item}) => renderDefaultMapItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
          scrollEnabled={false}
          ListEmptyComponent={<ListEmptyText text={`No ${sectionTitle}`}/>}
        />
      </View>
    );
  };

  const renderCustomBasemapsList = () => {
    let sectionTitle = 'Custom Basemaps';
    let customMapsToDisplay = Object.values(customMaps).filter(
      customMap => !customMap.overlay && customMap.source !== 'map_warper');
    if (!isOnline.isInternetReachable) {
      customMapsToDisplay = Object.values(offlineMaps).filter((map) => {
        if (map.id !== 'mapbox.outdoors' && map.id !== 'mapbox.satellite' && map.id !== 'osm'
          && map.id !== 'macrostrat') return offlineMaps[map.id];
      });
      sectionTitle = 'Offline Custom Basemaps';
    }
    return (
      <View style={{maxHeight: 250}}>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id}
          data={Object.values(customMapsToDisplay)}
          renderItem={({item}) => renderCustomMapItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={`No ${sectionTitle}`}/>}
        />
      </View>
    );
  };

  const renderCustomMapOverlaysList = () => {
    let sectionTitle = 'Custom Map Overlays';
    let customMapOverlaysToDisplay = Object.values(customMaps).filter(
      customMap => customMap.overlay && customMap.source !== 'map_warper');
    if (!isOnline.isInternetReachable) {
      customMapOverlaysToDisplay = customMapOverlaysToDisplay.filter(customMap => offlineMaps[customMap.id]);
      sectionTitle = 'Offline Custom Overlays';
    }
    return (
      <View style={{maxHeight: 250}}>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id}
          data={customMapOverlaysToDisplay}
          renderItem={({item}) => renderMapOverlayItem(item)}
          ListEmptyComponent={<ListEmptyText text={`No ${sectionTitle}`}/>}
        />
      </View>
    );
  };

  const renderCustomMapItem = customMap => (
    <ListItem
      containerStyle={styles.dialogContent}
      key={customMap.id}
      onPress={() => setBaseMap(customMap)}>
      <ListItem.Content style={{}}>
        <ListItem.Title style={commonStyles.listItemTitle}>
          {customMap.title || customMap.name || truncateText(customMap.id, 16)} -
          ({customMap.source || customMap.sources['raster-tiles'].type})
        </ListItem.Title>
        {!isOnline.isInternetReachable
          && <ListItem.Subtitle style={{paddingTop: 5}}>({customMap.count} tiles)</ListItem.Subtitle>}
      </ListItem.Content>
      {currentBasemap && customMap.id === currentBasemap.id
        && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
    </ListItem>
  );

  const renderDefaultMapItem = map => (
    <ListItem
      key={map.id}
      containerStyle={styles.dialogContent}
      onPress={() => isOnline.isInternetReachable ? useMaps.setBasemap(map.id) : useMapsOffline.setOfflineMapTiles(map)}
    >
      <ListItem.Content>
        <ListItem.Title style={commonStyles.listItemTitle}>{map.title || map.name}</ListItem.Title>
        {!isOnline.isInternetReachable
          && <ListItem.Subtitle style={{paddingTop: 5}}>({map.count} tiles)</ListItem.Subtitle>}
      </ListItem.Content>
      {currentBasemap && currentBasemap.id && map.id === currentBasemap.id
        && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
    </ListItem>
  );

  const renderMapOverlayItem = customMap => (
    <ListItem
      containerStyle={styles.dialogContent}
      key={customMap.id}
      // onPress={async () => {
      //   const baseMap = await useMaps.setBasemap(customMap.id);
      //   props.close();
      //   setTimeout(() => props.zoomToCustomMap(baseMap.bbox), 1000);
      // }}
    >
      <ListItem.Content style={{}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{customMap.title || customMap.name} -
          ({customMap.source})</ListItem.Title>
        {!isOnline.isInternetReachable
          && <ListItem.Subtitle style={{paddingTop: 5}}>({customMap.count} tiles)</ListItem.Subtitle>}
      </ListItem.Content>
      <Switch
        style={{marginRight: 10}}
        value={customMap.isViewable}
        onValueChange={val => useMaps.setCustomMapSwitchValue(val, customMap)}
      />
    </ListItem>
  );

  const setBaseMap = async (customMap) => {
    if (isOnline.isInternetReachable) {
      const baseMap = await useMaps.setBasemap(customMap.id);
      props.close();
      setTimeout(() => props.zoomToCustomMap(baseMap.bbox), 1000);
    }
    else {
      await useMapsOffline.setOfflineMapTiles(customMap);
      offlineMaps[customMap.id].bbox
      && setTimeout(() => props.zoomToCustomMap(offlineMaps[customMap.id].bbox, 10), 1000);
    }
  };

  return (
    <Overlay
      animationType={'slide'}
      isVisible={props.visible}
      overlayStyle={[homeStyles.dialogBox, styles.dialogBox]}
      onBackdropPress={props.onTouchOutside}
      backdropStyle={{backgroundColor: 'transparent'}}
    >
      <View style={[homeStyles.dialogTitleContainer, styles.dialogTitle]}>
        <Text style={[homeStyles.dialogTitleText, styles.dialogTitleText]}>Map Layers</Text>
      </View>
      <View>
        {renderDefaultBasemapsList()}
        {renderCustomBasemapsList()}
        {renderCustomMapOverlaysList()}
        <View/>
      </View>
    </Overlay>
  );
};

export default BaseMapDialog;
