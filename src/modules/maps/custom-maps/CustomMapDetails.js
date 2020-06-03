import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  TextInput,
  View,
  Switch,
  Keyboard,
  Dimensions,
  UIManager,
  Animated,
  Platform,
} from 'react-native';
import {Button, Input, ListItem, Slider} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import {customMapTypes} from '../maps.constants';
import {settingPanelReducers} from '../../main-menu-panel/mainMenuPanel.constants';
import SidePanelHeader from '../../main-menu-panel/SidePanelHeader';
import {mapReducers} from '../maps.constants';
// import Slider from '../../../shared/ui/Slider';
import useMapHook from '../useMaps';

// Styles
import sidePanelStyles from '../../main-menu-panel/sidePanel.styles';
import styles from './customMaps.styles';
import * as themes from '../../../shared/styles.constants';
import {SettingsMenuItems} from '../../main-menu-panel/mainMenu.constants';
import {isEmpty} from '../../../shared/Helpers';
import SaveAndDeleteButtons from '../../../shared/ui/SaveAndDeleteButtons';
import {homeReducers} from '../../home/home.constants';

const {State: TextInputState} = TextInput;

const AddCustomMaps = (props) => {
  const MBKeyboardType = Platform.OS === 'ios' ? 'url' : 'default';
  const MWKeyboardType = Platform.OS === 'ios' ? 'numeric' : 'phone-pad';
  const [useMaps] = useMapHook();

  const MBAccessToken = useSelector(state => state.user.mapboxToken);
  const customMapToEdit = useSelector(state => state.map.selectedCustomMapToEdit);

  const [editableCustomMapData, setEditableCustomMapData] = useState(null);
  const [textInputAnimate] = useState(new Animated.Value(0));
  const [slider, setSlider] = useState(editableCustomMapData ? editableCustomMapData.opacity : 1);

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
      dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: `Success! \n\nMap ${customMap.title} has been added or updated!`});
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


  const handleKeyboardDidShow = (event) => {
    const {height: windowHeight} = Dimensions.get('window');
    const keyboardHeight = event.endCoordinates.height;
    const currentlyFocusedField = TextInputState.currentlyFocusedField();
    if (currentlyFocusedField === null) {
      return;
    }
    else {
      UIManager.measure(currentlyFocusedField, (originX, originY, width, height, pageX, pageY) => {
        const fieldHeight = height;
        const fieldTop = pageY;
        const gap = (windowHeight - keyboardHeight) - (fieldTop + fieldHeight);
        if (gap >= 0) {
          return;
        }
        Animated.timing(
          textInputAnimate,
          {
            toValue: gap,
            duration: 200,
            useNativeDriver: true,
          },
        ).start();
      });
    }
  };

  const handleKeyboardDidHide = () => {
    Animated.timing(
      textInputAnimate,
      {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      },
    ).start();
  };

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
          <View>
            <Input
              value={editableCustomMapData.id}
              containerStyle={{borderBottomWidth: 0.5}}
              inputContainerStyle={{borderBottomWidth: 0}}
              onChangeText={text => setEditableCustomMapData(e => ({...e, id: text}))}
              keyboardType={MBKeyboardType}
              placeholderTextColor={'black'}
              placeholder={'Styles URL'}/>
            <Input
              inputContainerStyle={{borderBottomWidth: 0}}
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
              inputContainerStyle={{borderBottomWidth: 0}}
              placeholder={'Map ID'}
              placeholderTextColor={'black'}
            />
          </View>
        );
      case 'strabospot_mymaps':
        return (
          <View>
            <Input
              inputContainerStyle={{borderBottomWidth: 0}}
              placeholder={'Strabo Map ID'}
              placeholderTextColor={'black'}
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
          inputContainerStyle={{borderBottomWidth: 0}}
          style={sidePanelStyles.infoInputText}
          defaultValue={editableCustomMapData && editableCustomMapData.title}
          onChangeText={text => setEditableCustomMapData({...editableCustomMapData, title: text})}
        />
      </React.Fragment>
    );
  };

  const renderOverlay = () => {
    let sliderValuePercent = editableCustomMapData && (editableCustomMapData.opacity / 1).toFixed(1) * 100;
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
        {editableCustomMapData && editableCustomMapData.overlay &&
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
                  // onValueChange={(val) => setEditableCustomMapData(e => ({...e, opacity: val}))}
                  onValueChange={(val) => setSlider(val)}
                  onSlidingComplete={() => setEditableCustomMapData(e => ({...e, opacity: slider}))}
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

  const renderBackButton = () => {
    return (
      <SidePanelHeader
        title={'Custom Maps'}
        onPress={() => {
          dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
          dispatch({type: mapReducers.SELECTED_CUSTOM_MAP_TO_EDIT, customMap: {}});
        }}
      />
    );
  };
  return (
    <Animated.View style={[{flex: 1}, {transform: [{translateY: textInputAnimate}]}]}>
      <View style={sidePanelStyles.sidePanelHeaderContainer}>
        {renderBackButton()}
      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 2}]}>
        <Divider sectionText={'Custom Map Title'}/>
        <View style={sidePanelStyles.textInputNameContainer}>
          {renderTitle()}
        </View>
      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 3}]}>
        <Divider sectionText={'Overlay Settings'}/>
        <View style={styles.sectionsContainer}>
          {renderOverlay()}
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
        <View style={styles.sectionsContainer}>
          {renderMapDetails()}
        </View>
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
