import React, {useEffect, useState} from 'react';
import {FlatList, Switch, Text, View} from 'react-native';

import {Icon, ListItem, Overlay} from 'react-native-elements';
import {useSelector} from 'react-redux';

import overlayStyles from './overlay.styles';
import commonStyles from '../../shared/common.styles';
import {isEmpty, truncateText} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import {BASEMAPS} from '../maps/maps.constants';
import useMapsOfflineHook from '../maps/offline-maps/useMapsOffline';
import useMapsHook from '../maps/useMaps';

const BaseMapDialog = ({mapComponentRef, ...props}) => {

  const [useMaps] = useMapsHook();
  const useMapsOffline = useMapsOfflineHook();

  const [dialogTitle, setDialogTitle] = useState('Map Layers');

  const customMaps = useSelector(state => state.map.customMaps);
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const customEndpoint = useSelector(state => state.connections.databaseEndpoint);
  const {isConnected, isInternetReachable} = useSelector(state => state.connections.isOnline);
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
    if (!isInternetReachable && !isConnected) {
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
    const sectionTitle = 'Custom Basemaps';
    let customMapsToDisplay = customEndpoint.isSelected
      ? Object.values(customMaps).filter(customMap => !customMap.overlay && customMap.url[0].includes('192.'))
      : Object.values(customMaps).filter(customMap => !customMap.overlay && !customMap.url[0].includes('192.'));

    return (
      <View style={{maxHeight: 250}} key={'CustomMapsList'}>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id + 'CustomMap'}
          data={Object.values(customMapsToDisplay)}
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
    let customMapOverlaysToDisplay = customEndpoint.isSelected
      ? Object.values(customMaps).filter(customMap => customMap.overlay && customMap.url[0].includes('192.'))
      : Object.values(customMaps).filter(customMap => customMap.overlay && !customMap.url[0].includes('192.'));

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
        key={customMap.id + 'CustomMapItem'}
        onPress={() => setBasemap(customMap)}>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>
            {customMap.title || customMap.name || truncateText(customMap?.id, 16)} -
            ({customMap.source || customMap.sources['raster-tiles'].type})
          </ListItem.Title>
        </ListItem.Content>
        {customMap.id === currentBasemap?.id && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
      </ListItem>
    );
  };

  const renderOfflineCustomMapItem = (customMap) => {
    return (
      <ListItem
        key={customMap.id + 'OfflineCustomMapItem'}
        onPress={() => setBasemap(customMap)}>
        <ListItem.Content>
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
      containerStyle={overlayStyles.overlayContent}
      key={customMap.id + 'CustomOverlayItem' + (isOffline ? 'Offline' : '')}
      // onPress={async () => {
      //   const baseMap = await useMaps.setBasemap(customMap.id);
      //   props.close();
      //   setTimeout(() => mapComponentRef.current?.zoomToCustomMap(baseMap.bbox), 1000);
      // }}
    >
      <ListItem.Content>
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

  const setBasemap = async (customMap) => {
    let baseMap = {};
    if ((isInternetReachable && isConnected) || (!isInternetReachable && isConnected)) {
      if (!customMap.url) baseMap = await useMapsOffline.setOfflineMapTiles(customMap);
      else baseMap = await useMaps.setBasemap(customMap.id);
      baseMap.bbox && setTimeout(() => mapComponentRef.current?.zoomToCustomMap(baseMap?.bbox), 1000);
    }
    else {
      await useMapsOffline.setOfflineMapTiles(customMap);
      offlineMaps[customMap.id].bbox
      && setTimeout(() => mapComponentRef.current?.zoomToCustomMap(offlineMaps[customMap.id].bbox, 10), 1000);
    }
  };

  const determineWhatCustomMapListToRender = () => {
    if (isInternetReachable && isConnected) return [renderCustomBasemapsList(), renderCustomMapOverlaysList()];
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
      backdropStyle={{backgroundColor: 'transparent'}}
      isVisible={props.visible}
      onBackdropPress={props.onTouchOutside}
      overlayStyle={[overlayStyles.overlayContainer, props.overlayStyle]}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={[overlayStyles.titleText]}>{dialogTitle}</Text>
      </View>
      {renderDefaultBasemapsList()}
      {determineWhatCustomMapListToRender()}
    </Overlay>
  );
};

export default BaseMapDialog;
