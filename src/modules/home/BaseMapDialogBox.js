import React, {useEffect, useState} from 'react';
import {FlatList, Switch, View} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';
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

const slideAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

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
    let dataArr = [];
    let sectionTitle = 'Custom Basemaps';
    let customMapsToDisplay = Object.values(customMaps).filter(
      customMap => !customMap.overlay && customMap.url[0].includes('strabospot'));
    let customMapsToDisplayUsingAltEndpoint = Object.values(customMaps).filter(
      customMap => !customMap.overlay && customMap.url[0].includes('192.'));
    dataArr = customEndpoint.isSelected ? customMapsToDisplayUsingAltEndpoint : customMapsToDisplay;

    return (
      <View style={{maxHeight: 250}}>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id}
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
      <View style={{maxHeight: 250}}>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id}
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

  const renderOfflineCustomMapOverlayList = () => {
    let customMapOverlaysToDisplay = Object.values(customMaps).filter(
      customMap => customMap.overlay);
    const offlineCustomMapOverlaysToDisplay = customMapOverlaysToDisplay.filter(customMap => offlineMaps[customMap.id]);
    const sectionTitle = 'Offline Custom Overlays';
    return (
      <View style={{maxHeight: 250}}>
        <SectionDivider dividerText={sectionTitle}/>
        <FlatList
          keyExtractor={item => item.id}
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
        key={customMap.id}
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
        key={customMap.id}
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
      key={map.id}
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
    <Dialog
      dialogAnimation={slideAnimation}
      dialogStyle={styles.dialogBox}
      visible={props.visible}
      dialogTitle={
        <DialogTitle
          title={dialogTitle}
          style={styles.dialogTitle}
          textStyle={styles.dialogTitleText}
        />}
      onTouchOutside={props.onTouchOutside}
    >
      <DialogContent>
        <View>
          {renderDefaultBasemapsList()}
          {determineWhatCustomMapListToRender()}
          <View/>
        </View>
      </DialogContent>
    </Dialog>
  );
};

export default BaseMapDialog;
