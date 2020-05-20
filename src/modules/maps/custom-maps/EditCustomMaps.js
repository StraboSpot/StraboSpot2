import React, {useEffect, useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import Divider from '../../main-menu-panel/MainMenuPanelDivider';
import {Button, Icon} from 'react-native-elements';
import {settingPanelReducers} from '../../main-menu-panel/mainMenuPanel.constants';
import {useDispatch, useSelector} from 'react-redux';

import SidePanelHeader from '../../main-menu-panel/SidePanelHeader';

// Styles
import sidePanelStyles from '../../main-menu-panel/sidePanel.styles';

const EditCustomMaps = (props) => {
  console.log(props);
  const dispatch = useDispatch();
  const customMapToEdit = useSelector(state => state.map.selectedCustomMapToEdit);
  const customMaps = useSelector(state => state.map.customMaps);

  const [text, setText] = useState(null);
  const [editableCustomMapData, setEditableCustomMapData] = useState({
    title: customMapToEdit.title || null,
    opacity: customMapToEdit.opacity,
    isOverlay: customMapToEdit.isOverlay,
    styleUrl: customMapToEdit.url,
  });

  useEffect(() => {
    console.log('Selected custom map', editableCustomMapData.title);
    return function cleanUp() {
    }
  }, [editableCustomMapData, customMapToEdit])

  const saveAndClose = (i) => {
    const selectedMapId = customMaps.filter((mapId, i) => customMapToEdit.id === mapId.id);
    console.log(selectedMapId)
    dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false});
    // dispatch({type: mapReducers.CUSTOM_MAPS, customMaps: [...customMaps, editableCustomMapData});
  };

  const renderBackButton = () => {
    return (
      <SidePanelHeader
        title={'Custom Maps'}
        onPress={() => dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, view: null, bool: false})}
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
            defaultValue={customMapToEdit.title}
            onChangeText={text => setEditableCustomMapData({...editableCustomMapData, title: text})}
          />
        </View>
      </View>
      <View style={sidePanelStyles.sectionContainer}>
        <Divider sectionText={'overlay settings'}/>

      </View>
      <View style={sidePanelStyles.sectionContainer}>
        <Divider sectionText={'map source'}/>

      </View>
      <View style={sidePanelStyles.sectionContainer}>
        <Divider sectionText={'map details'}/>

      </View>
      <View style={sidePanelStyles.sectionContainer}>
        <Button
          title={'Save'}
          onPress={() => saveAndClose()}
        />
      </View>
    </React.Fragment>
  );
};

export default EditCustomMaps;
