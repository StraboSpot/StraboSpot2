import React from 'react';
import {ScrollView, Switch, Text, View} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SectionDivider from '../../shared/ui/SectionDivider';
import {basemaps} from '../maps/maps.constants';
import useMapsHook from '../maps/useMaps';
import styles from './dialog.styles';

const slideAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

const BaseMapDialog = props => {

  const [useMaps] = useMapsHook();
  const customMaps = useSelector(state => state.map.customMaps);
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const isOnline = useSelector(state => state.home.isOnline);
  const offlineMap = useSelector(state => state.map.offlineMaps);
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
        {isOnline && <View style={!isEmpty(customMaps) && {borderBottomWidth: 1}}>
          <SectionDivider dividerText={'Default Basemaps'}/>
          {basemaps.map((map, i) => {
            return <ListItem
              key={map.id}
              containerStyle={styles.dialogContent}
              bottomDivider={i < basemaps.length - 2}
              onPress={() => props.onPress(map.id)}>
              <ListItem.Content>
                <ListItem.Title style={styles.dialogText}>{map.title}</ListItem.Title>
              </ListItem.Content>
              {currentBasemap && currentBasemap.id && map.id === currentBasemap.id
              && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
            </ListItem>;
          })}
        </View>}
        {!isOnline && (
          <View style={!isEmpty(customMaps) && {borderBottomWidth: 1}}>
            <SectionDivider dividerText={'Offline Default Basemaps'}/>
            {Object.values(offlineMap).map((map, i) => {
              if (map.id === 'mapbox.outdoors' || map.id === 'mapbox.satellite' || map.id === 'osm'
                || map.id === 'macrostrat') {
                return (
                  <ListItem
                    key={map.id}
                    containerStyle={styles.dialogContent}
                    bottomDivider={i < basemaps.length - 2}
                    onPress={() => props.onPress(map.id)}>
                    <ListItem.Content>
                      <ListItem.Title style={styles.dialogText}>{map.title}</ListItem.Title>
                    </ListItem.Content>
                    {currentBasemap && map.id === currentBasemap.id
                    && <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
                  </ListItem>
                );
              }
              else return null;
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
                      {isOnline && customMap.id === currentBasemap.id &&
                      <Icon type={'ionicon'} color={themes.BLUE} name={'checkmark-outline'}/>}
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
            return customMap.overlay && (
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
            );
          })}
        </ScrollView>}
      </DialogContent>
    </Dialog>
  );
};

export default BaseMapDialog;
