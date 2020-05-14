import React, {useState} from 'react';
import {FlatList, Text, TextInput, View} from 'react-native';
import { ListItem} from 'react-native-elements';import {useDispatch} from 'react-redux';

import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import {customMapTypes} from '../maps.constants';
import {settingPanelReducers} from '../../main-menu-panel/mainMenuPanel.constants';
import SidePanelHeader from '../../main-menu-panel/SidePanelHeader';

// Styles
import sidePanelStyles from '../../main-menu-panel/sidePanel.styles';
import styles from './customMaps.styles';


const AddCustomMaps = (props) => {

  const [editableCustomMapData, setEditableCustomMapData] = useState({
    title: '',
    opacity: 0.5,
    isOverlay: false,
    styleUrl: '',
  });
  const [mapType, setMapType] = useState(customMapTypes.MAPBOX_STYLES);

  const dispatch = useDispatch();

  const selectMap = (item) => {
    console.log(item)
    setMapType(item)
  };

  const renderCustomMapName = (item) => {
      console.log(item)
      return (
          <ListItem
            containerStyle={styles.list}
            title={item}
            checkmark={item === mapType}
            onPress={() => selectMap(item)}
          />
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
    <React.Fragment>
      <View style={sidePanelStyles.sidePanelHeaderContainer}>
        {renderBackButton()}
      </View>
      <View style={sidePanelStyles.sectionContainer}>
        <Divider sectionText={'Custom Map Title'}/>
        <View style={sidePanelStyles.textInputNameContainer}>
          <TextInput
            style={sidePanelStyles.infoInputText}
            onChangeText={text => setEditableCustomMapData({...editableCustomMapData, title: text})}
          />
        </View>
      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 2}]}>
        <Divider sectionText={'Map Type'}/>
        <View>
          {/*{renderCustomMapName()}*/}
          <FlatList
            keyExtractor={item => item.name}
            data={Object.values(customMapTypes)}
            renderItem={({item}) => renderCustomMapName(item)}
          />
        </View>

      </View>
      <View style={[sidePanelStyles.sectionContainer, {flex: 3}]}>
        <Divider sectionText={'Map Details'}/>

      </View>
    </React.Fragment>
  );
};

export default AddCustomMaps;
