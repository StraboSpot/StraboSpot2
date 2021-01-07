import React from 'react';
import {ScrollView, Switch, View} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SectionDivider from '../../shared/ui/SectionDivider';
import {BASEMAPS, CUSTOMBASEMAPS} from '../maps/maps.constants';
import useMapsOfflineHook from '../maps/offline-maps/useMapsOffline';
import useMapsHook from '../maps/useMaps';
import styles from './dialog.styles';

const slideAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

const BaseMapDialog = props => {

  const [useMaps] = useMapsHook();
  const useMapsOffline = useMapsOfflineHook();

  const customMaps = useSelector(state => state.map.customMaps);
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const isOnline = useSelector(state => state.home.isOnline);
  const offlineMaps = useSelector(state => state.offlineMap.offlineMaps);
  const customMapsArr = Object.values(customMaps);

  return (
    <Dialog
      dialogAnimation={slideAnimation}
      dialogStyle={styles.dialogBox}
      visible={props.visible}
      dialogTitle={
        <DialogTitle
          title='Map Layers'
          style={styles.dialogTitle}
          textStyle={styles.dialogTitleText}
        />}
      onTouchOutside={props.onTouchOutside}
    >
      <DialogContent>
        {isOnline && (
          <View style={!isEmpty(customMaps) && {borderBottomWidth: 1}}>
            <SectionDivider dividerText={'Default Basemaps'}/>
            {BASEMAPS.map((map, i) => {
              return (
                <ListItem
                  key={map.id}
                  containerStyle={styles.dialogContent}
                  bottomDivider={i < BASEMAPS.length - 2}
                  onPress={() => props.onPress(map.id)}>
                  <ListItem.Content>
                    <ListItem.Title style={styles.dialogText}>{map.title}</ListItem.Title>
                  </ListItem.Content>
                  {currentBasemap && currentBasemap.id && map.id === currentBasemap.id
                  && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
                </ListItem>
              );
            })}
          </View>
        )}
        {!isOnline && (
          <View style={!isEmpty(customMaps) && {borderBottomWidth: 1}}>
            <SectionDivider dividerText={'Offline Default Basemaps'}/>
            {Object.values(offlineMaps).map((map, i) => {
              // if (map.source === 'strabo_spot_mapbox') {
                return (
                  <ListItem
                    key={map.id}
                    containerStyle={styles.dialogContent}
                    bottomDivider={i < BASEMAPS.length - 2}
                    onPress={() => useMapsOffline.setOfflineMapTiles(map)}>
                    <ListItem.Content>
                      <ListItem.Title style={styles.dialogText}>{useMapsOffline.getMapName(map)} ({map.count} tiles)</ListItem.Title>
                    </ListItem.Content>
                    {currentBasemap && map.id === currentBasemap.id
                    && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
                  </ListItem>
                );
              // }
            })}
          </View>
        )}
        {!isOnline && !isEmpty(customMaps)&& (
          <View>
            <SectionDivider dividerText={'Offline Custom Basemaps'}/>
            {Object.values(offlineMaps).map((map, i) => {
              if (map.source === 'map_warper' || map.source === 'strabospot_mymaps') {
                return (
                  <ListItem
                    key={map.id}
                    bottomDivider={i < CUSTOMBASEMAPS.length - 2}
                    onPress={() => useMapsOffline.setOfflineMapTiles(map)}
                  >
                    <ListItem.Content>
                      <ListItem.Title style={styles.dialogText}>{useMapsOffline.getMapName(map)}</ListItem.Title>
                    </ListItem.Content>
                    {currentBasemap && map.id === currentBasemap.id
                    && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
                  </ListItem>
                );
              }
            })}
          </View>
        )}
        <View>
          {!isEmpty(customMaps) && customMapsArr.some(map => !map.overlay) && isOnline && (
            <ScrollView style={{maxHeight: 400}}>
              <SectionDivider dividerText={'Custom Basemaps'}/>
              {customMapsArr.map((customMap, i) => {
                return (
                  !customMap.overlay
                  && (
                    <ListItem
                      containerStyle={styles.customBaseMapListContainer}
                      bottomDivider={i < customMapsArr.length - 1}
                      key={customMap.id}
                      onPress={() => {
                        useMaps.viewCustomMap(customMap);
                        props.close();
                      }}>
                      <ListItem.Content>
                        <View style={styles.itemContainer}>
                          <ListItem.Title style={styles.customBaseMapListText}>{customMap.title}</ListItem.Title>
                        </View>
                      </ListItem.Content>
                      {isOnline && currentBasemap && customMap.id === currentBasemap.id
                      && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
                    </ListItem>
                  )
                );
              })}
            </ScrollView>
          )}
        </View>
        {!isEmpty(customMaps) && customMapsArr.some(map => map.overlay) && <ScrollView style={{maxHeight: 400}}>
          <SectionDivider dividerText={'Custom Map Overlays'} style={{}}/>
          {customMapsArr.map((customMap, i) => {
            return (
              customMap.overlay && (
                <ListItem
                  containerStyle={styles.customBaseMapListContainer}
                  bottomDivider={i < customMapsArr.length - 1}
                  key={customMap.id}>
                  <ListItem.Content>
                    <View style={styles.itemContainer}>
                      <ListItem.Title style={styles.customBaseMapListText}>{customMap.title}</ListItem.Title>
                    </View>
                  </ListItem.Content>
                  <Switch
                    style={{marginRight: 10}}
                    value={customMap.isViewable}
                    onValueChange={(val) => useMaps.setCustomMapSwitchValue(val, customMap)}
                  />
                </ListItem>
              )
            );
          })}
        </ScrollView>}
      </DialogContent>
    </Dialog>
  );
};

export default BaseMapDialog;
