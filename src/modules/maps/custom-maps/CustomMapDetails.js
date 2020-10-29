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

import {Button, Icon, Input, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import * as Helpers from '../../../shared/Helpers';
import {BLUE, DARKGREY} from '../../../shared/styles.constants';
import ButtonRounded from '../../../shared/ui/ButtonRounded';
import Slider from '../../../shared/ui/Slider';
import {addedStatusMessage,
  clearedStatusMessages,
  setErrorMessagesModalVisible,
  setStatusMessagesModalVisible,
} from '../../home/home.slice';
import {setMenuSelectionPage, setSidePanelVisible} from '../../main-menu-panel/mainMenuPanel.slice';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import sidePanelStyles from '../../main-menu-panel/sidePanel.styles';
import SidePanelHeader from '../../main-menu-panel/sidePanel/SidePanelHeader';
import {customMapTypes, mapReducers} from '../maps.constants';
import {addedCustomMap, selectedCustomMapToEdit} from '../maps.slice';
import useMapHook from '../useMaps';
import styles from './customMaps.styles';

const {State: TextInputState} = TextInput;

const AddCustomMaps = () => {
  const MBKeyboardType = Platform.OS === 'ios' ? 'url' : 'default';
  const MWKeyboardType = Platform.OS === 'ios' ? 'numeric' : 'phone-pad';
  const [useMaps] = useMapHook();

  const MBAccessToken = useSelector(state => state.user.mapboxToken);
  const customMapToEdit = useSelector(state => state.map.selectedCustomMapToEdit);

  const [editableCustomMapData, setEditableCustomMapData] = useState(null);
  const [textInputAnimate] = useState(new Animated.Value(0));

  const dispatch = useDispatch();

  let sliderValuePercent = editableCustomMapData && Math.round(editableCustomMapData.opacity * 100).toFixed(0);
  console.log(sliderValuePercent);
  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return function cleanup() {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHide);
      dispatch(selectedCustomMapToEdit({}));
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
      dispatch(addedCustomMap(customMap));
      dispatch(setSidePanelVisible({view: null, bool: false}));
      dispatch(setMenuSelectionPage({name: undefined}));
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage({statusMessage: 'Success!'}));
      dispatch(addedStatusMessage({statusMessage: `\nMap ${customMap.title} has been added or updated!`}));
      dispatch(setStatusMessagesModalVisible(true));
    }
    else {
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage(
        {statusMessage: 'Something Went Wrong \n\nCheck the id and map type of the map you are trying to save.'}));
      dispatch(setErrorMessagesModalVisible(true));
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
    const radioSelected = <Icon name={'radiobox-marked'} type={'material-community'} color={BLUE}/>;
    const radioUnslected = <Icon name={'radiobox-blank'} type={'material-community'} color={DARKGREY}/>;
    return (
      <ListItem
        // containerStyle={styles.list}
        bottomDivider={i < Object.values(customMapTypes).length - 1}
      >
        <ListItem.Content style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <ListItem.Title>{item.title}</ListItem.Title>
          <ListItem.CheckBox
            checked={editableCustomMapData && item.source === editableCustomMapData.source}
            checkedIcon={radioSelected}
            uncheckedIcon={radioUnslected}
            onPress={() => selectMap(item.source)}
          />
        </ListItem.Content>
      </ListItem>
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
          scrollEnabled={false}
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
        <ListItem containerStyle={styles.list}>
          <ListItem.Content style={styles.listItemContentContainer}>
            <ListItem.Title style={{textAlign: 'justify', margin: 0, paddingRight: 30}}>Display as
              overlay</ListItem.Title>
            <Switch
              value={editableCustomMapData && editableCustomMapData.overlay}
              onValueChange={val => setEditableCustomMapData(e => ({...e, overlay: val}))}
            />
          </ListItem.Content>
        </ListItem>
      </React.Fragment>
    );
  };

  const renderSidePanelHeader = () => {
    return (
      <SidePanelHeader
        backButton={() => {
          dispatch(setSidePanelVisible({bool: false}));
          dispatch(selectedCustomMapToEdit({}));
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
      <View style={[sidePanelStyles.sectionContainer, {flex: 4}]}>
        <Divider sectionText={'Overlay Settings'}/>
        <View style={styles.sectionsContainer}>
          {renderOverlay()}
          {editableCustomMapData && editableCustomMapData.overlay && (
            <ListItem containerStyle={styles.list}>
              <ListItem.Content style={{}}>
                <ListItem.Title>Opacity</ListItem.Title>
                <ListItem.Subtitle style={{paddingLeft: 10}}>{sliderValuePercent}%</ListItem.Subtitle>
              </ListItem.Content>
              <View style={{flex: 2}}>
                <Slider
                  value={editableCustomMapData && editableCustomMapData.opacity}
                  onValueChange={(val) => setEditableCustomMapData(e => ({...e, opacity: val}))}
                  maximumValue={1}
                  minimumValue={0.05}
                  step={0.05}
                />
              </View>
            </ListItem>
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
        <ButtonRounded
          title={'Save'}
          onPress={() => addMap()}
        />
        <ButtonRounded
          title={'Delete Map'}
          buttonStyle={{backgroundColor: 'red'}}
          onPress={() => confirmDeleteMap()}
        />
      </View>
    </Animated.View>

  );
};

export default AddCustomMaps;
