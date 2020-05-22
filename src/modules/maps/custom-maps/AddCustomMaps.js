import React, {useEffect, useState} from 'react';
import {
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
// import Slider from '../../../shared/ui/Slider';
import useMapHook from '../useMaps';

// Styles
import sidePanelStyles from '../../main-menu-panel/sidePanel.styles';
import styles from './customMaps.styles';
import * as themes from '../../../shared/styles.constants';

const {State: TextInputState} = TextInput;

const AddCustomMaps = (props) => {
  const MBKeyboardType = Platform.OS === 'ios' ? 'url' : 'default';
  const MWKeyboardType = Platform.OS === 'ios' ? 'numeric' : 'phone-pad';
  const [useMaps] = useMapHook();

  const MBAccessToken = useSelector(state => state.user.mapboxToken);

  const [editableCustomMapData, setEditableCustomMapData] = useState({
    title: '',
    opacity: 0,
    isOverlay: false,
    id: '',
    accessToken: MBAccessToken,
  });
  const [mapType, setMapType] = useState('map_warper');
  const [textInputAnimate] = useState(new Animated.Value(0));

  const dispatch = useDispatch();

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return function cleanup() {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHide);
      console.log('Listners Removed');
    };
  }, []);

  useEffect(() => {
    console.log((editableCustomMapData.opacity / 1).toFixed(1) * 100);
  }, [editableCustomMapData.opacity]);

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
    setMapType(source);
  };

  const renderCustomMapName = (item, i) => {
    return (
      <ListItem
        containerStyle={styles.list}
        title={item.title}
        bottomDivider={i < Object.values(customMapTypes).length - 1}
        checkmark={item.source === mapType}
        onPress={() => selectMap(item.source)}
      />
    );
  };

  const renderMapDetails = () => {
    switch (mapType) {
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
          // data={Object.values(customMapTypes)}
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
          value={editableCustomMapData.title}
          onChangeText={text => setEditableCustomMapData({...editableCustomMapData, title: text})}
        />
      </React.Fragment>
    );
  };

  const renderOverlay = () => {
    let sliderValuePercent = (editableCustomMapData.opacity / 1).toFixed(1) * 100;
    return (
      <React.Fragment>
        <ListItem
          containerStyle={sidePanelStyles.infoInputText}
          title={'Display as overlay'}
          rightElement={
            <Switch
              value={editableCustomMapData.isOverlay}
              onValueChange={val => setEditableCustomMapData(e => ({...e, isOverlay: val}))}
            />
          }
        />
        {editableCustomMapData.isOverlay &&
        <View style={{}}>
          <ListItem
            containerStyle={{borderTopWidth: 0.5, padding: 0, paddingLeft: 10}}
            title={'Opacity'}
            subtitle={`(${sliderValuePercent}%)`}
            subtitleStyle={{fontSize: 12, paddingLeft: 15}}
            rightElement={
              <View style={{flex: 2}}>
                <Slider
                  sliderValue={editableCustomMapData.opacity}
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

  const renderBackButton = () => {
    return (
      <SidePanelHeader
        title={'Custom Maps'}
        onPress={() => dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false})}
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
        <Button
          containerStyle={styles.saveButtonContainer}
          buttonStyle={{borderRadius: 20, width: 100}}
          title={'Save'}
          onPress={() => useMaps.checkMap(mapType, editableCustomMapData)}
        />
      </View>
    </Animated.View>

  );
};

export default AddCustomMaps;
