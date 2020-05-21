import React, {useEffect, useState} from 'react';
import {Text, View, Switch, ScrollView} from 'react-native';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {basemaps, basemaps1} from '../maps/maps.constants';
import {isEmpty} from '../../shared/Helpers';
import SectionDivider from '../../shared/ui/SectionDivider';

// Hooks
import useMapsHook from '../maps/useMaps';

// Styles
import styles from './dialog.styles';
import * as themes from '../../shared/styles.constants';

const slideAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

const BaseMapDialog = props => {

  const [useMaps] = useMapsHook();
  const dispatch = useDispatch();
  const customMaps = useSelector(state => state.map.customMaps);
  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const [mapOverlays, setMapOverlays] = useState([]);
  const [customBaseMaps, setCustomBasemaps] = useState([]);

  useEffect(() => {
    // overLayMaps();
  }, [customMaps]);

  // useEffect(() => {
  //   console.log('Custom Maps changed');
  // }, [customMaps, customBaseMaps, mapOverlays]);

  // const overLayMaps = () => {
  //   Object.values(customMaps).filter(map => {
  //     if (map.overlay) setMapOverlays(mapOverlaysArr => [...mapOverlaysArr, map]);
  //     else setCustomBasemaps(customBaseMapsArr => [...customBaseMapsArr, map]);
  //   });
  // };

  return (
    <Dialog
      width={0.3}
      dialogAnimation={slideAnimation}
      dialogStyle={styles.dialogBox}
      visible={props.visible}
      dialogTitle={
        <DialogTitle
          title='Map Layers'
          style={styles.dialogTitle}
          textStyle={
            {
              color: 'white',
              fontSize: themes.PRIMARY_TEXT_SIZE,
              fontWeight: 'bold',
            }
          }
        />}
      onTouchOutside={props.onTouchOutside}
    >
      <DialogContent>
        <View style={!isEmpty(customMaps) && {borderBottomWidth: 1}}>
          <SectionDivider dividerText={'Default Basemaps'}/>
          {basemaps1.map((map, i) => {
            return <ListItem
              key={map.id}
              title={map.title}
              containerStyle={styles.dialogContent}
              bottomDivider={i < basemaps1.length - 2}
              titleStyle={styles.dialogText}
              onPress={() => props.onPress(map.id)}
              checkmark={currentBasemap && map.id === currentBasemap.id}
            />;
          })}
        </View>
        <View>
          {!isEmpty(customMaps) && <ScrollView style={{maxHeight: 400, width: 350}}>
            <SectionDivider dividerText={'Custom Basemaps'} style={{}}/>
            {Object.values(customMaps).map((customMap, i) => {
              return !customMap.overlay &&
                <ListItem
                  containerStyle={styles.customBaseMapListContainer}
                  bottomDivider={i < Object.values(customMaps).length - 1}
                  key={customMap.id}
                  checkmark={customMap.id === currentBasemap.id}
                  onPress={() => useMaps.viewCustomMap(customMap)}
                  title={
                    <View style={styles.itemContainer}>
                      <Text style={styles.customBaseMapListText}>{customMap.title}</Text>
                    </View>
                  }
                  // rightElement={
                  //   <Switch
                  //     style={{marginRight: 10}}
                  //     value={customMap.isViewable}
                  //     onValueChange={(val) => useMaps.setCustomMapSwitchValue(val, customMap)}
                  //   />
                  // }
                />
            })}
          </ScrollView>}
        </View>
        {!isEmpty(customMaps) && <ScrollView style={{maxHeight: 400, width: 350}}>
          {/*<View style={styles.dialogTitle}>*/}
          {/*  <Text style={[commonStyles.dialogTitleText, {paddingTop: 10, textAlign: 'left'}]}>Custom Overlays</Text>*/}
          {/*</View>*/}
          <SectionDivider dividerText={'Custom Map Overlays'} style={{}}/>
          {Object.values(customMaps).map((customMap, i) => {
            return customMap.overlay &&
              <ListItem
                containerStyle={styles.customBaseMapListContainer}
                bottomDivider={i < Object.values(customMaps).length - 1}
                key={customMap.id}
                title={
                  <View style={styles.itemContainer}>
                    <Text style={styles.customBaseMapListText}>{customMap.title}</Text>
                  </View>
                }
                rightElement={
                  <Switch
                    style={{marginRight: 10}}
                    value={customMap.isViewable}
                    onValueChange={(val) => useMaps.setCustomMapSwitchValue(val, customMap)}
                  />
                }
              />;
          })}
        </ScrollView>}
      </DialogContent>
    </Dialog>
  );
};

export default BaseMapDialog;
