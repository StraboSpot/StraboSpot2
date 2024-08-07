import React, {useEffect, useState} from 'react';
import {FlatList, Platform, Switch, Text, View} from 'react-native';

import {Button, Icon, Input, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import customMapStyles from './customMaps.styles';
import useCustomMapHook from './useCustomMap';
import commonStyles from '../../../shared/common.styles';
import {isEmpty} from '../../../shared/Helpers';
import * as themes from '../../../shared/styles.constants';
import {BLUE, DARKGREY, WARNING_COLOR} from '../../../shared/styles.constants';
import alert from '../../../shared/ui/alert';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import SectionDivider from '../../../shared/ui/SectionDivider';
import SliderBar from '../../../shared/ui/SliderBar';
import {formStyles} from '../../form';
import {
  addedStatusMessage,
  clearedStatusMessages,
  removedLastStatusMessage,
  setIsErrorMessagesModalVisible,
  setIsStatusMessagesModalVisible,
  setLoadingStatus,
} from '../../home/home.slice';
import {setMenuSelectionPage, setSidePanelVisible} from '../../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../../main-menu-panel/sidePanel/SidePanelHeader';
import {CUSTOM_MAP_TYPES} from '../maps.constants';
import {selectedCustomMapToEdit} from '../maps.slice';

const CustomMapDetails = () => {
  const MBKeyboardType = Platform.OS === 'ios' ? 'url' : 'default';
  const MWKeyboardType = Platform.OS === 'ios' ? 'numeric' : 'phone-pad';

  const useCustomMap = useCustomMapHook();

  const dispatch = useDispatch();
  const MBAccessToken = useSelector(state => state.user.mapboxToken);
  const customMapToEdit = useSelector(state => state.map.selectedCustomMapToEdit);

  const [editableCustomMapData, setEditableCustomMapData] = useState({});

  useEffect(() => {
    // console.log('UE CustomMapDetails [customMapToEdit]', customMapToEdit);
    if (!isEmpty(customMapToEdit)) setEditableCustomMapData(customMapToEdit);
    else {
      setEditableCustomMapData({
        title: '',
        opacity: 1,
        overlay: false,
        id: '',
        source: '',
        key: MBAccessToken,
      });
    }
  }, [customMapToEdit]);

  const addMap = async () => {
    try {
      dispatch(clearedStatusMessages());
      dispatch(setIsStatusMessagesModalVisible(true));
      dispatch(setLoadingStatus({view: 'modal', bool: true}));
      dispatch(addedStatusMessage('Saving Custom Map...'));
      const customMap = await useCustomMap.saveCustomMap(editableCustomMapData);
      console.log(customMap);
      dispatch(setSidePanelVisible({view: null, bool: false}));
      dispatch(setMenuSelectionPage({name: null}));
      dispatch(removedLastStatusMessage());
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      dispatch(addedStatusMessage('Success!'));
      dispatch(addedStatusMessage(`\nMap ${customMap.title} has been added or updated!`));
    }
    catch (err) {
      console.error('Error saving custom map', err);
      dispatch(setLoadingStatus({view: 'modal', bool: false}));
      dispatch(setIsStatusMessagesModalVisible(false));
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage(
        `Something Went Wrong \n\nCheck the id and/or the map type you are trying to save. \n\n ${err}`));
      dispatch(setIsErrorMessagesModalVisible(true));
    }
  };

  const confirmDeleteMap = async () => {
    // console.log(customMapToEdit.id);
    alert(
      'Delete Custom Map',
      'Are your sure you want to delete ' + customMapToEdit.title + '?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => useCustomMap.deleteMap(customMapToEdit.id),
        },
      ],
      {cancelable: false},
    );
  };

  const renderCustomMapName = (item) => {
    const radioSelected = <Icon name={'radiobox-marked'} type={'material-community'} color={BLUE}/>;
    const radioUnselected = <Icon name={'radiobox-blank'} type={'material-community'} color={DARKGREY}/>;
    return (
      <ListItem containerStyle={commonStyles.listItem}>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{item.title}</ListItem.Title>
        </ListItem.Content>
        <ListItem.CheckBox
          checked={item.source === editableCustomMapData?.source}
          checkedIcon={radioSelected}
          uncheckedIcon={radioUnselected}
          onPress={() => setEditableCustomMapData(e => ({...e, source: item.source}))}
        />
      </ListItem>
    );
  };

  const renderMapDetails = () => {
    return (
      <>
        <SectionDivider dividerText={'Map Details'}/>
        <View>
          {editableCustomMapData?.source === 'mapbox_styles' && (
            <Input
              inputStyle={{...formStyles.fieldValue, backgroundColor: 'white'}}
              containerStyle={{paddingHorizontal: 0}}
              inputContainerStyle={{borderBottomWidth: 0}}
              keyboardType={MBKeyboardType}
              value={editableCustomMapData.id}
              onChangeText={text => setEditableCustomMapData(e => ({...e, id: text}))}
              placeholder={'Style URL'}
              placeholderTextColor={themes.MEDIUMGREY}
              // onBlur={validate}
              errorMessage={editableCustomMapData && isEmpty(editableCustomMapData.id) && 'Style URL is required'}
              errorStyle={customMapStyles.requiredMessage}
            />
          )}
          {editableCustomMapData?.source === 'map_warper' && (
            <Input
              inputStyle={{...formStyles.fieldValue, backgroundColor: 'white'}}
              containerStyle={{paddingHorizontal: 0}}
              inputContainerStyle={{borderBottomWidth: 0}}
              keyboardType={MWKeyboardType}
              value={editableCustomMapData.id}
              onChangeText={text => setEditableCustomMapData(e => ({...e, id: text}))}
              placeholder={'Map ID'}
              placeholderTextColor={themes.MEDIUMGREY}
              // onBlur={validate}
              errorMessage={editableCustomMapData && isEmpty(editableCustomMapData.id) && 'Map ID is required'}
              errorStyle={customMapStyles.requiredMessage}
            />
          )}
          {editableCustomMapData?.source === 'strabospot_mymaps' && (
            <Input
              inputStyle={{...formStyles.fieldValue, backgroundColor: 'white'}}
              containerStyle={{paddingHorizontal: 0}}
              inputContainerStyle={{borderBottomWidth: 0}}
              value={editableCustomMapData.id}
              onChangeText={text => setEditableCustomMapData(e => ({...e, id: text}))}
              placeholder={'Strabo My Maps ID'}
              placeholderTextColor={themes.MEDIUMGREY}
              errorMessage={editableCustomMapData && isEmpty(editableCustomMapData.id) && 'Map ID is required'}
              errorStyle={customMapStyles.requiredMessage}
            />
          )}
        </View>
        {!isEmpty(customMapToEdit) && <View style={customMapStyles.mapTypeInfoContainer}>
          <Text style={customMapStyles.mapTypeInfoText}>Map available from:</Text>
          <Text style={customMapStyles.mapTypeInfoText}>{customMapToEdit?.url[0]}</Text>
        </View>}
      </>
    );
  };

  const renderMapTypeList = () => (
    <View>
      <SectionDivider dividerText={'Map Type'}/>
      <View style={customMapStyles.mapTypeInfoContainer}>
        <Text style={customMapStyles.mapTypeInfoText}>
          If you wish to save a new MapWarper map please download the <Text style={{fontWeight: 'bold'}}>.tiff </Text>
          file from Mapwarper.net and upload it into your Strabo MyMaps account.
        </Text>
      </View>
      <FlatList
        keyExtractor={item => item.source}
        data={CUSTOM_MAP_TYPES}
        renderItem={({item, index}) => renderCustomMapName(item, index)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
      {editableCustomMapData?.source === ''
        && <Text style={customMapStyles.requiredMessage}>Map type is required</Text>}
    </View>
  );

  const renderTitle = () => {
    return (
      <>
        <SectionDivider dividerText={'Custom Map Title'}/>
        <Input
          inputStyle={{...formStyles.fieldValue, backgroundColor: 'white'}}
          containerStyle={{paddingHorizontal: 0}}
          inputContainerStyle={{borderBottomWidth: 0}}
          onChangeText={text => setEditableCustomMapData({...editableCustomMapData, title: text})}
          value={editableCustomMapData?.title || ''}
          errorMessage={editableCustomMapData && isEmpty(editableCustomMapData.title) && 'Title is required'}
          errorStyle={customMapStyles.requiredMessage}
        />
      </>
    );
  };

  const renderOverlay = () => {
    const opacity = editableCustomMapData?.opacity && typeof (editableCustomMapData.opacity) === 'number'
    && editableCustomMapData.opacity >= 0 && editableCustomMapData.opacity <= 1 ? editableCustomMapData.opacity : 1;
    const sliderValuePercent = Math.round(opacity * 100).toFixed(0);
    return (
      <>
        <SectionDivider dividerText={'Overlay Settings'}/>
        <ListItem containerStyle={commonStyles.listItem}>
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>Display as overlay</ListItem.Title>
          </ListItem.Content>
          <Switch
            value={editableCustomMapData?.overlay}
            onValueChange={val => setEditableCustomMapData(e => ({...e, overlay: val}))}
          />
        </ListItem>
        {editableCustomMapData?.overlay && (
          <ListItem containerStyle={commonStyles.listItem}>
            <ListItem.Content>
              <ListItem.Title style={commonStyles.listItemTitle}>Opacity</ListItem.Title>
              <ListItem.Subtitle style={{paddingLeft: 10}}>{sliderValuePercent}%</ListItem.Subtitle>
            </ListItem.Content>
            <View style={{flex: 2}}>
              <SliderBar
                value={opacity}
                onValueChange={val => setEditableCustomMapData(e => ({...e, opacity: val}))}
                maximumValue={1}
                minimumValue={0.05}
                step={0.05}
                labels={[]}
              />
            </View>
          </ListItem>
        )}
      </>
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
        headerTitle={!isEmpty(customMapToEdit) ? 'Edit Map' : 'Add Map'}
      />
    );
  };

  return (
    <>
      <View>
        {renderSidePanelHeader()}
        {renderTitle()}
        {renderOverlay()}
        {renderMapTypeList()}
        {(editableCustomMapData?.source === 'mapbox_styles' || editableCustomMapData?.source === 'map_warper'
          || editableCustomMapData?.source === 'strabospot_mymaps') && renderMapDetails()}
      </View>
      <View style={{paddingBottom: 20}}>
        <Button
          title={!isEmpty(customMapToEdit) ? 'Update' : 'Save'}
          containerStyle={commonStyles.standardButtonContainer}
          type={'clear'}
          disabled={editableCustomMapData && (isEmpty(editableCustomMapData.title) || isEmpty(editableCustomMapData.id)
            || editableCustomMapData.source === 'map_warper')}
          onPress={() => addMap()}
        />
        <Button
          title={'Delete Map'}
          titleStyle={{color: WARNING_COLOR}}
          containerStyle={commonStyles.standardButtonContainer}
          type={'clear'}
          onPress={() => confirmDeleteMap()}
        />
      </View>
    </>
  );
};

export default CustomMapDetails;
