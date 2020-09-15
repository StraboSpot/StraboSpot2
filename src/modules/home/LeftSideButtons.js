import React, {useState} from 'react';
import {Animated, Text, View} from 'react-native';

import {useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import UseMapsHook from '../maps/useMaps';
import BaseMapDialog from './BaseMapDialogBox';
import MapActionsDialog from './MapActionsDialogBox';
import MapSymbolsDialog from './MapSymbolsDialogBox';

const LeftSideButtons = (props) => {

  const [useMaps] = UseMapsHook();
  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const isMainMenuPanelVisible = useSelector(state => state.home.isSettingsPanelVisible);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const [dialogs, setDialogs] = useState({
    mapActionsMenuVisible: false,
    mapSymbolsMenuVisible: false,
    baseMapMenuVisible: false,
    notebookPanelMenuVisible: false,
  });
  const [buttons, setButtons] = useState({
    userLocationButtonOn: false,
  });

  // Toggle given dialog between true (visible) and false (hidden)
  const toggleDialog = dialog => {
    console.log('Toggle', dialog);
    setDialogs({
      ...dialogs,
      [dialog]: !dialogs[dialog],
    });
    console.log(dialog, 'is set to', dialogs[dialog]);
  };

  // Toggle given button between true (on) and false (off)
  const toggleButton = (button, isVisible) => {
    console.log('Toggle Button', button, isVisible || !buttons[button]);
    setButtons({
      ...buttons,
      [button]: isVisible !== undefined ? isVisible : !buttons[button],
    });
  };

  return (
    <React.Fragment>
      <View style={{position: 'absolute', top: 10}}>
        <IconButton
          source={isMainMenuPanelVisible
            ? require('../../assets/icons/HomeButton_pressed.png')
            : require('../../assets/icons/HomeButton.png')}
          onPress={() => props.toggleHomeDrawer()}
        />
      </View>
      <View style={{position: 'absolute', bottom: 130}}>
        <IconButton
          source={require('../../assets/icons/MapActionsButton.png')}
          onPress={() => toggleDialog('mapActionsMenuVisible')}
        />
        {isAllSymbolsOn
          ? (
            <IconButton
              source={require('../../assets/icons/SymbolsButton.png')}
              onPress={() => toggleDialog('mapSymbolsMenuVisible')}
            />
          ) : (
            <IconButton
              source={require('../../assets/icons/SymbolsButton_pressed.png')}
              onPress={() => toggleDialog('mapSymbolsMenuVisible')}
            />
          )
        }
        {!props.currentImageBasemap && (
          <IconButton
            source={require('../../assets/icons/layersButton.png')}
            onPress={() => toggleDialog('baseMapMenuVisible')}
          />
        )}
        <MapActionsDialog
          visible={dialogs.mapActionsMenuVisible}
          onPress={(name) => {
            props.dialogClickHandler('mapActionsMenuVisible', name);
            toggleDialog('mapActionsMenuVisible');
          }}
          onTouchOutside={() => toggleDialog('mapActionsMenuVisible')}
        />
        <MapSymbolsDialog
          visible={dialogs.mapSymbolsMenuVisible}
          onPress={(name) => props.dialogClickHandler('mapSymbolsMenuVisible', name)}
          onTouchOutside={() => toggleDialog('mapSymbolsMenuVisible')}
        />
        <BaseMapDialog
          visible={dialogs.baseMapMenuVisible}
          close={() => toggleDialog('baseMapMenuVisible')}
          onPress={(name) => {
            useMaps.setCurrentBasemap(name);
            toggleDialog('baseMapMenuVisible');
          }}
          onTouchOutside={() => toggleDialog('baseMapMenuVisible')}
        />
      </View>
      {!currentImageBasemap && <View style={{position: 'absolute', bottom: 10}}>
        <IconButton
          source={buttons.userLocationButtonOn
            ? require('../../assets/icons/MyLocationButton_pressed.png')
            : require('../../assets/icons/MyLocationButton.png')}
          onPress={() => {
            props.clickHandler('toggleUserLocation', buttons.userLocationButtonOn);
            toggleButton('userLocationButtonOn');
          }}
        />
      </View>}
      {currentImageBasemap && <View style={{position: 'absolute', bottom: 10}}>
        <IconButton
          source={require('../../assets/icons/Close.png')}
          onPress={props.clickHandler('closeImageBasemap')}
        />
      </View>}
    </React.Fragment>
  );
};

export default LeftSideButtons;
