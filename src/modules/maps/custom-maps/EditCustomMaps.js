import React, {useEffect, useState} from 'react';
import {Alert, FlatList, Switch, Text, TextInput, View} from 'react-native';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import {Button, Icon, ListItem, Slider} from 'react-native-elements';
import {settingPanelReducers} from '../../main-menu-panel/mainMenuPanel.constants';
import {useDispatch, useSelector} from 'react-redux';

import SidePanelHeader from '../../main-menu-panel/SidePanelHeader';
import SaveAndDeleteButtons from '../../../shared/ui/SaveAndDeleteButtons';

// Hooks
import useMapHook from '../useMaps';

// Styles
import sidePanelStyles from '../../main-menu-panel/sidePanel.styles';
import styles from './customMaps.styles';
import * as themes from '../../../shared/styles.constants';
import {mapReducers} from '../maps.constants';

const EditCustomMaps = (props) => {
  const dispatch = useDispatch();
  const customMapToEdit = useSelector(state => state.map.selectedCustomMapToEdit);
  const customMaps = useSelector(state => state.map.customMaps);

  const initialEditableState = {
    title: customMapToEdit.title || null,
    opacity: customMapToEdit.opacity === 0 ? 1 : customMapToEdit.opacity,
    overlay: customMapToEdit.overlay || false,
    styleUrl: customMapToEdit.url,
  };

  const [useMaps] = useMapHook();

  const [slider, setSlider] = useState(5)
  const [editableCustomMapData, setEditableCustomMapData] = useState({...customMapToEdit, ...initialEditableState});
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    // console.log('Selected custom map', editableCustomMapData.title);
    // return function cleanUp() {
    //   console.log('BLAH')
    // }
    if (customMapToEdit.id !== editableCustomMapData.id) {
      setEditableCustomMapData(customMapToEdit);
    }
    console.log('editableCustomMapData', editableCustomMapData)
  }, [customMapToEdit, initialEditableState, editableCustomMapData]);

  const confirmDeleteMap = async () => {
    // console.log(customMapToEdit.id);
    Alert.alert(
      'Delete Custom Map',
      'Are your sure you want to delete ' + customMapToEdit.title + '?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => useMaps.deleteMap(customMapToEdit.id),
        },
      ],
      {cancelable: false},
    );
  };

  const saveAndClose = (i) => {
    const customMapCopy = {...customMapToEdit};
    customMapCopy.opacity = editableCustomMapData.opacity;
    customMapCopy.overlay =  editableCustomMapData.overlay;
    customMapCopy.title = editableCustomMapData.title;
    console.log(customMapCopy)
    dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
    dispatch({type: mapReducers.ADD_CUSTOM_MAP, customMap: customMapCopy});
  };

  const renderBackButton = () => {
    return (
      <SidePanelHeader
        title={'Custom Maps'}
        onPress={() => dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, view: null, bool: false})}
      />
    );
  };

  const renderOverlay = (map, i) => {
    console.log('AAAAAAAAAAAAAAAA', map)
    let sliderValuePercent = (editableCustomMapData.opacity / 1).toFixed(1) * 100;
    return (
      <React.Fragment>
        <View>
        <ListItem
          containerStyle={sidePanelStyles.infoInputText}
          title={'Display as overlay'}
          rightElement={
            <Switch
              value={editableCustomMapData.overlay}
              onValueChange={val => setEditableCustomMapData(e => ({...e, overlay: val}))}
            />
          }
        />
        </View>
        {editableCustomMapData.overlay &&
        <View style={{}}>
          <ListItem
            containerStyle={{borderTopWidth: 0.5, padding: 0, paddingLeft: 10}}
            title={'Opacity'}
            subtitle={`(${sliderValuePercent}%)`}
            subtitleStyle={{fontSize: 12, paddingLeft: 15}}
           rightElement={
              <View style={{flex: 2, paddingTop: 10, paddingBottom: 10}}>
                <Slider
                  value={editableCustomMapData.opacity}
                  onValueChange={(val) => setEditableCustomMapData(e => ({...e, opacity: val}))}
                  maximumValue={1}
                  minimumValue={0}
                  step={0.1}
                  thumbStyle={{borderWidth: 1, borderColor: 'grey'}}
                  minimumTrackTintColor={themes.PRIMARY_ACCENT_COLOR}
                  maximumTrackTintColor={themes.PRIMARY_BACKGROUND_COLOR}
                  thumbTintColor={themes.PRIMARY_BACKGROUND_COLOR}
                />
              </View>
            }
          />
        </View>
        }
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <View style={sidePanelStyles.sidePanelHeaderContainer}>
        {renderBackButton()}
      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 2}]}>
        <Divider sectionText={'Custom Map Title'}/>
        <View style={sidePanelStyles.textInputNameContainer}>
          <TextInput
            style={sidePanelStyles.infoInputText}
            defaultValue={customMapToEdit.title}
            onChangeText={text => setEditableCustomMapData({...editableCustomMapData, title: text})}
          />
        </View>
      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 3}]}>
        <Divider sectionText={'overlay settings'}/>
        <View style={styles.sectionsContainer}>
          {/*{renderOverlay()}*/}
          <FlatList
            // keyExtractor={item => item.id}
            scrollEnabled={false}
            extraData={refresh}
            data={[customMapToEdit]}
            renderItem={({item, i}) => renderOverlay(item)}
          />
        </View>
      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 3}]}>
        <Divider sectionText={'map type'}/>
      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 2}]}>
        <Divider sectionText={'map details'}/>

      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 3}]}>
        <SaveAndDeleteButtons
          title={'Save'}
          onPress={() => saveAndClose()}
        />
        <SaveAndDeleteButtons
          title={'Delete Map'}
          buttonStyle={{backgroundColor: 'red'}}
          onPress={() => confirmDeleteMap()}
        />
      </View>
    </React.Fragment>
  );
};

export default EditCustomMaps;
