import React, {useEffect, useState} from 'react';
import {FlatList, Switch, Text, View} from 'react-native';

import {Icon, ListItem, Overlay} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty, truncateText} from '../../shared/Helpers';
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

  const [dialogTitle, setDialogTitle] = useState('Map Layers');

  const customMaps = useSelector(state => state.map.customMaps);
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const customEndpoint = useSelector(state => state.project.databaseEndpoint);
  const {isConnected, isInternetReachable} = useSelector(state => state.home.isOnline);
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);

  useEffect(() => {
    if (customEndpoint.isSelected) setDialogTitle(`Map Layers - ${customEndpoint.url}`);
  }, []);

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
    if (!isInternetReachable && isConnected) {
      mapsToDisplay = Object.values(offlineMaps).reduce((acc, offlineMap) => {
        return offlineMap.source === 'strabo_spot_mapbox' || offlineMap.id === 'mapbox.outdoors'
        || offlineMap.id === 'mapbox.satellite' || offlineMap.id === 'osm' || offlineMap.id === 'macrostrat'
          ? [...acc, offlineMap]
          : acc;
      }, []);
      sectionTitle = 'Offline Default Basemaps';
    }
    return (
      <View key={'DefaultMapsList'}>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id + 'DefaultMap'}
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
    let dataArr = [];
    let sectionTitle = 'Custom Basemaps';
    let customMapsToDisplay = Object.values(customMaps).filter(
      customMap => !customMap.overlay && customMap.url[0].includes('strabospot'));
    let customMapsToDisplayUsingAltEndpoint = Object.values(customMaps).filter(
      customMap => !customMap.overlay && customMap.url[0].includes('192.'));
    dataArr = customEndpoint.isSelected ? customMapsToDisplayUsingAltEndpoint : customMapsToDisplay;

    return (
      <View style={{maxHeight: 250}} key={'CustomMapsList'}>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id + 'CustomMap'}
          data={Object.values(dataArr)}
          renderItem={({item}) => renderCustomMapItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={`No ${sectionTitle}`}/>}
        />
      </View>
    );
  };

  const renderOfflineCustomBasemapList = () => {
    const customOfflineMapsToDisplay = Object.values(offlineMaps).filter((map) => {
      if (map.id !== 'mapbox.outdoors' && map.id !== 'mapbox.satellite' && map.id !== 'osm'
        && map.id !== 'macrostrat' && !isEmpty(map)) return offlineMaps[map.id];
    });
    const sectionTitle = 'Offline Custom Basemaps';
    return (
      <View style={{maxHeight: 250}} key={'OfflineCustomMapsList'}>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id + 'OfflineCustomMap'}
          data={Object.values(customOfflineMapsToDisplay)}
          renderItem={({item}) => renderOfflineCustomMapItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={`No ${sectionTitle}`}/>}
        />
      </View>
    );
  };

  const renderCustomMapOverlaysList = () => {
    let sectionTitle = 'Custom Overlays';
    let customMapOverlaysToDisplay = Object.values(customMaps).filter(
      customMap => customMap.overlay);
    // if (!isInternetReachable && isConnected) {
    //   customMapOverlaysToDisplay = customMapOverlaysToDisplay.filter(customMap => offlineMaps[customMap.id]);
    //   sectionTitle = 'Offline Custom Overlays';
    // }
    return (
      <View style={{maxHeight: 250}} key={'CustomOverlaysList'}>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id + 'CustomOverlay'}
          data={customMapOverlaysToDisplay}
          renderItem={({item}) => renderMapOverlayItem(item)}
          ListEmptyComponent={<ListEmptyText text={`No ${sectionTitle}`}/>}
        />
      </View>
    );
  };

  const renderOfflineCustomMapOverlayList = () => {
    let customMapOverlaysToDisplay = Object.values(customMaps).filter(
      customMap => customMap.overlay);
    const offlineCustomMapOverlaysToDisplay = customMapOverlaysToDisplay.filter(customMap => offlineMaps[customMap.id]);
    const sectionTitle = 'Offline Custom Overlays';
    return (
      <View style={{maxHeight: 250}} key={'OfflineCustomOverlaysList'}>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id + 'OfflineCustomOverlay'}
          data={offlineCustomMapOverlaysToDisplay}
          renderItem={({item}) => renderMapOverlayItem(item)}
          ListEmptyComponent={<ListEmptyText text={`No ${sectionTitle}`}/>}
        />
      </View>
    );
  };

  const renderCustomMapItem = (customMap) => {
    return (
      <ListItem
        containerStyle={styles.dialogContent}
        key={customMap.id + 'CustomMapItem'}
        onPress={() => setBaseMap(customMap)}>
        <ListItem.Content style={{}}>
          <ListItem.Title style={commonStyles.listItemTitle}>
            {customMap.title || customMap.name || truncateText(customMap?.id, 16)} -
            ({customMap.source || customMap.sources['raster-tiles'].type})
          </ListItem.Title>
          {/*{!isInternetReachable && !isConnected*/}
          {/*  && <ListItem.Subtitle style={{paddingTop: 5}}>({customMap.count} tiles!!!)</ListItem.Subtitle>}*/}
        </ListItem.Content>
        {customMap.id === currentBasemap?.id && currentBasemap.sources[currentBasemap.id].tiles[0].includes('http://')
          && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
      </ListItem>
    );
  };

  const renderOfflineCustomMapItem = (customMap) => {
    return (
      <ListItem
        containerStyle={styles.dialogContent}
        key={customMap.id + 'OfflineCustomMapItem'}
        onPress={() => setBaseMap(customMap)}>
        <ListItem.Content style={{}}>
          <ListItem.Title style={commonStyles.listItemTitle}>
            {customMap.title || customMap.name || truncateText(customMap?.id, 16)} -
            ({customMap.source || customMap.sources['raster-tiles'].type})
          </ListItem.Title>
          {/*{!isInternetReachable && !isConnected*/}
          {/*  && <ListItem.Subtitle style={{paddingTop: 5}}>({customMap.count} tiles!!!)</ListItem.Subtitle>}*/}
        </ListItem.Content>
        {customMap.id === currentBasemap?.id && currentBasemap.sources[currentBasemap.id].tiles[0].includes('file:/')
          && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
      </ListItem>
    );
  };

  const renderDefaultMapItem = map => (
    <ListItem
      key={map.id + 'DefaultMapItem'}
      containerStyle={styles.dialogContent}
      onPress={() => isInternetReachable ? useMaps.setBasemap(map.id) : useMapsOffline.setOfflineMapTiles(map)}
    >
      <ListItem.Content>
        <ListItem.Title style={commonStyles.listItemTitle}>{map.title || map.name}</ListItem.Title>
        {!isInternetReachable
          && <ListItem.Subtitle style={{paddingTop: 5}}>({map.count} tiles)</ListItem.Subtitle>}
      </ListItem.Content>
      {currentBasemap && currentBasemap.id && map.id === currentBasemap.id
        && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
    </ListItem>
  );

  const renderMapOverlayItem = (customMap, isOffline) => (
    <ListItem
      containerStyle={styles.dialogContent}
      key={customMap.id + 'CustomOverlayItem' + (isOffline ? 'Offline' : '')}
      // onPress={async () => {
      //   const baseMap = await useMaps.setBasemap(customMap.id);
      //   props.close();
      //   setTimeout(() => props.zoomToCustomMap(baseMap.bbox), 1000);
      // }}
    >
      <ListItem.Content style={{}}>
        <ListItem.Title style={commonStyles.listItemTitle}>{customMap.title || customMap.name} -
          ({customMap.source})</ListItem.Title>
        {!isInternetReachable
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
    let baseMap = {};
    if ((isInternetReachable && isConnected) || (!isInternetReachable && isConnected)) {
      if (!customMap.url) {
        baseMap = await useMapsOffline.setOfflineMapTiles(customMap);
      }
      else {
        baseMap = await useMaps.setBasemap(customMap.id);
      }
      props.close();
      baseMap.bbox && setTimeout(() => props.zoomToCustomMap(baseMap?.bbox), 1000);
    }
    else {
      await useMapsOffline.setOfflineMapTiles(customMap);
      offlineMaps[customMap.id].bbox && setTimeout(() => props.zoomToCustomMap(offlineMaps[customMap.id].bbox, 10),
        1000);
    }
  };

  const determineWhatCustomMapListToRender = () => {
    if (isInternetReachable && isConnected) return [renderCustomBasemapsList(), renderCustomMapOverlaysList(), renderOfflineCustomBasemapList()];
    else if (!isInternetReachable && isConnected) {
      return [
        renderCustomBasemapsList(),
        renderOfflineCustomBasemapList(),
        renderCustomMapOverlaysList(),
        renderOfflineCustomMapOverlayList(),
      ];
    }
    else return [renderOfflineCustomBasemapList(), renderOfflineCustomMapOverlayList()];
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
        <Text style={[homeStyles.dialogTitleText, styles.dialogTitleText]}>{dialogTitle}</Text>
      </View>
      <View>
        {renderDefaultBasemapsList()}
        {determineWhatCustomMapListToRender()}
        <View/>
      </View>
    </Overlay>
  );
};

export default BaseMapDialog;
