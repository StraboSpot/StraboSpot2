import React, {useEffect, useState} from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  FlatList,
  Platform,
  Switch,
  TextInput,
  View,
} from 'react-native';

import {Button, Input, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import * as Helpers from '../../../shared/Helpers';
import SaveAndDeleteButtons from '../../../shared/ui/SaveAndDeleteButtons';
import Slider from '../../../shared/ui/Slider';
import {homeReducers} from '../../home/home.constants';
import {SettingsMenuItems} from '../../main-menu-panel/mainMenu.constants';
import {settingPanelReducers} from '../../main-menu-panel/mainMenuPanel.constants';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import sidePanelStyles from '../../main-menu-panel/sidePanel.styles';
import SidePanelHeader from '../../main-menu-panel/sidePanel/SidePanelHeader';
import {customMapTypes, mapReducers} from '../maps.constants';
import useMapHook from '../useMaps';
import styles from './customMaps.styles';

const {State: TextInputState} = TextInput;

const AddCustomMaps = () => {
  let sliderValuePercent = editableCustomMapData && (editableCustomMapData.opacity / 1).toFixed(1) * 100;
  const MBKeyboardType = Platform.OS === 'ios' ? 'url' : 'default';
  const MWKeyboardType = Platform.OS === 'ios' ? 'numeric' : 'phone-pad';
  const [useMaps] = useMapHook();

  const MBAccessToken = useSelector(state => state.user.mapboxToken);
  const customMapToEdit = useSelector(state => state.map.selectedCustomMapToEdit);

  const [editableCustomMapData, setEditableCustomMapData] = useState(null);
  const [textInputAnimate] = useState(new Animated.Value(0));

  const dispatch = useDispatch();

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return function cleanup() {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHide);
      dispatch({type: mapReducers.SELECTED_CUSTOM_MAP_TO_EDIT, customMap: {}});
      console.log('Listners Removed');
    };
  }, []);

  useEffect(() => {
    if (!isEmpty(customMapToEdit)) setEditableCustomMapData(customMapToEdit);
    else {
      setEditableCustomMapData({
        title: '',
        opacity: 1,
        overlay: false,
        id: '',
        source: 'map_warper',
        accessToken: MBAccessToken,
      });
    }
  }, [customMapToEdit]);

  const addMap = async () => {
    const customMap = await useMaps.saveCustomMap(editableCustomMapData);
    console.log(customMap);
    if (customMap !== undefined) {
      dispatch({type: mapReducers.ADD_CUSTOM_MAP, customMap: customMap});
      dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, view: null, bool: false});
      dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.SETTINGS_MAIN});
      dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Success!'});
      dispatch(
        {type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: `\nMap ${customMap.title} has been added or updated!`});
      dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, bool: true});
    }
    else {
      dispatch({type: homeReducers.CLEAR_STATUS_MESSAGES});
      dispatch({
        type: homeReducers.ADD_STATUS_MESSAGE,
        statusMessage: 'Something Went Wrong \n\nCheck the id and map type of the map you are trying to save.',
      });
      dispatch({type: homeReducers.SET_ERROR_MESSAGES_MODAL_VISIBLE, bool: true});
    }
  };

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

  const handleKeyboardDidShow = (event) => Helpers.handleKeyboardDidShow(event, TextInputState, textInputAnimate);

  const handleKeyboardDidHide = () => Helpers.handleKeyboardDidHide(textInputAnimate);

  const selectMap = (source) => {
    console.log(source);
    setEditableCustomMapData(e => ({...e, source: source}));
  };

  const renderCustomMapName = (item, i) => {
    return (
      <ListItem
        containerStyle={styles.list}
        title={item.title}
        bottomDivider={i < Object.values(customMapTypes).length - 1}
        checkmark={editableCustomMapData && item.source === editableCustomMapData.source}
        onPress={() => selectMap(item.source)}
      />
    );
  };

  const renderMapDetails = () => {
    switch (editableCustomMapData && editableCustomMapData.source) {
      case 'mapbox_styles':
        return (
          <View style={{padding: 0}}>
            <Input
              value={editableCustomMapData.id}
              inputContainerStyle={sidePanelStyles.textInputNameContainer}
              onChangeText={text => setEditableCustomMapData(e => ({...e, id: text}))}
              keyboardType={MBKeyboardType}
              placeholderTextColor={'black'}
              placeholder={'Styles URL'}/>
            <Input
              inputContainerStyle={sidePanelStyles.textInputNameContainer}
              placeholderTextColor={'black'}
              onChangeText={text => setEditableCustomMapData(e => ({...e, accessToken: text}))}
              defaultValue={editableCustomMapData.accessToken}
              placeholder={'Access token'}/>
          </View>
        );
      case 'map_warper':
        return (
          <View>
            <Input
              keyboardType={MWKeyboardType}
              defaultValue={editableCustomMapData.id}
              onChangeText={text => setEditableCustomMapData(e => ({...e, id: text}))}
              inputContainerStyle={sidePanelStyles.textInputNameContainer}
              placeholder={'Map ID'}
              placeholderTextColor={'black'}
            />
          </View>
        );
      case 'strabospot_mymaps':
        return (
          <View>
            <Input
              inputContainerStyle={sidePanelStyles.textInputNameContainer}
              placeholder={'Strabo Map ID'}
              placeholderTextColor={'black'}
              defaultValue={editableCustomMapData.id}
              onChangeText={text => setEditableCustomMapData(e => ({...e, id: text}))}
            />
            {/*<Input inputContainerStyle={{borderBottomWidth: 0}}*/}
            {/*       placeholder={'Access token'}/>*/}
          </View>
        );
    }
  };

  const renderMapTypeList = () => (
    <React.Fragment>
      <View>
        <FlatList
          keyExtractor={item => item.source}
          data={customMapTypes}
          renderItem={({item, index}) => renderCustomMapName(item, index)}
        />
      </View>
    </React.Fragment>
  );

  const renderTitle = () => {
    return (
      <React.Fragment>
        <Input
          containerStyle={sidePanelStyles.infoInputText}
          inputContainerStyle={sidePanelStyles.textInputNameContainer}
          style={sidePanelStyles.infoInputText}
          defaultValue={editableCustomMapData && editableCustomMapData.title}
          onChangeText={text => setEditableCustomMapData({...editableCustomMapData, title: text})}
        />
      </React.Fragment>
    );
  };

  const renderOverlay = () => {
    return (
      <React.Fragment>
        <ListItem
          containerStyle={sidePanelStyles.infoInputText}
          title={'Display as overlay'}
          rightElement={
            <Switch
              value={editableCustomMapData && editableCustomMapData.overlay}
              onValueChange={val => setEditableCustomMapData(e => ({...e, overlay: val}))}
            />
          }
        />
      </React.Fragment>
    );
  };

  const renderSidePanelHeader = () => {
    return (
      <SidePanelHeader
        backButton={() => {
          dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
          dispatch({type: mapReducers.SELECTED_CUSTOM_MAP_TO_EDIT, customMap: {}});
        }}
        title={'Custom Maps'}
        headerTitle={'Add Map'}
      />
    );
  };
  return (
    <Animated.View style={[{flex: 1}, {transform: [{translateY: textInputAnimate}]}]}>
      {renderSidePanelHeader()}
      <View style={[sidePanelStyles.sectionContainer, {flex: 2, paddingTop: 10}]}>
        <Divider sectionText={'Custom Map Title'}/>
        {renderTitle()}
      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 3}]}>
        <Divider sectionText={'Overlay Settings'}/>
        <View style={styles.sectionsContainer}>
          {renderOverlay()}
          {editableCustomMapData && editableCustomMapData.overlay && (
            <View style={{}}>
              <ListItem
                containerStyle={{borderTopWidth: 0.5, padding: 0, paddingLeft: 10}}
                title={'Opacity'}
                subtitle={`(${sliderValuePercent}%)`}
                subtitleStyle={{fontSize: 12, paddingLeft: 15}}
                rightElement={
                  <View style={{flex: 2}}>
                    <Slider
                      value={editableCustomMapData && editableCustomMapData.opacity}
                      onValueChange={(val) => setEditableCustomMapData(e => ({...e, opacity: val}))}
                      maximumValue={1}
                      minimumValue={0}
                      step={0.1}
                    />
                  </View>
                }
              />
            </View>
          )}
        </View>
      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 5}]}>
        <Divider sectionText={'Map Type'}/>
        <View style={styles.sectionsContainer}>
          {renderMapTypeList()}
        </View>
        <Button
          titleStyle={{fontSize: 14}}
          type={'clear'}
          title={'More information'}
          onPress={() => console.log('More information')}
        />
      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 3}]}>
        <Divider sectionText={'Map Details'}/>
        {renderMapDetails()}
      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 3}]}>
        <SaveAndDeleteButtons
          title={'Save'}
          onPress={() => addMap()}
        />
        <SaveAndDeleteButtons
          title={'Delete Map'}
          buttonStyle={{backgroundColor: 'red'}}
          onPress={() => confirmDeleteMap()}
        />
      </View>
    </Animated.View>

  );
};

export default AddCustomMaps;
