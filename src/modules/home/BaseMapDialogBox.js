import React from 'react';
import {ListItem} from 'react-native-elements';
import {ScaleAnimation} from 'react-native-popup-dialog/src';
import {ScrollView, Switch, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import Dialog, {DialogContent, DialogTitle} from 'react-native-popup-dialog';

// Components
import SectionDivider from '../../shared/ui/SectionDivider';

// Utilites
import {isEmpty} from '../../shared/Helpers';

// Hooks
import useMapsHook from '../maps/useMaps';

// Styles
import styles from './dialog.styles';

// Constants
import {basemaps} from '../maps/maps.constants';

const slideAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

const BaseMapDialog = props => {

  const [useMaps] = useMapsHook();
  const customMaps = useSelector(state => state.map.customMaps);
  const currentBasemap = useSelector(state => state.map.currentBasemap);
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
        <View style={!isEmpty(customMaps) && {borderBottomWidth: 1}}>
          <SectionDivider dividerText={'Default Basemaps'}/>
          {basemaps.map((map, i) => {
            return <ListItem
              key={map.id}
              title={map.title}
              containerStyle={styles.dialogContent}
              bottomDivider={i < basemaps.length - 2}
              titleStyle={styles.dialogText}
              onPress={() => props.onPress(map.id)}
              checkmark={currentBasemap && map.id === currentBasemap.id}
            />;
          })}
        </View>
        <View>
          {!isEmpty(customMaps) && customMapsArr.some(map => !map.overlay) && <ScrollView style={{maxHeight: 400}}>
            <SectionDivider dividerText={'Custom Basemaps'} style={{}}/>
            {customMapsArr.map((customMap, i) => {
              return !customMap.overlay &&
                <ListItem
                  containerStyle={styles.customBaseMapListContainer}
                  bottomDivider={i < customMapsArr.length - 1}
                  key={customMap.id}
                  checkmark={customMap.id === currentBasemap.id}
                  onPress={() => {
                    useMaps.viewCustomMap(customMap);
                    props.close();
                  }}
                  title={
                    <View style={styles.itemContainer}>
                      <Text style={styles.customBaseMapListText}>{customMap.title}</Text>
                    </View>
                  }
                />;
            })}
          </ScrollView>}
        </View>
        {!isEmpty(customMaps) && customMapsArr.some(map => map.overlay) && <ScrollView style={{maxHeight: 400}}>
          <SectionDivider dividerText={'Custom Map Overlays'} style={{}}/>
          {customMapsArr.map((customMap, i) => {
            return customMap.overlay &&
              <ListItem
                containerStyle={styles.customBaseMapListContainer}
                bottomDivider={i < customMapsArr.length - 1}
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
