import React, {useState} from 'react';
import {Animated} from 'react-native';

import {useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import UseMapsHook from '../maps/useMaps';
import BaseMapDialog from './BaseMapDialogBox';
import homeStyles from './home.style';
import MapActionsDialog from './MapActionsDialogBox';
import MapSymbolsDialog from './MapSymbolsDialogBox';

const LeftSideButtons = (props) => {

  const [useMaps] = UseMapsHook();
  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
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

  return (
    <React.Fragment>
      <Animated.View style={[homeStyles.homeIconContainer, props.leftsideIconAnimation]}>
        <IconButton
          source={isMainMenuPanelVisible
            ? require('../../assets/icons/HomeButton_pressed.png')
            : require('../../assets/icons/HomeButton.png')}
          onPress={() => props.toggleHomeDrawer()}
        />
      </Animated.View>
      <Animated.View style={[homeStyles.leftsideIcons, props.leftsideIconAnimation]}>
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
        {!currentImageBasemap && (
          <IconButton
            source={require('../../assets/icons/layersButton.png')}
            onPress={() => toggleDialog('baseMapMenuVisible')}
          />
        )}
      </Animated.View>
      <MapActionsDialog
        visible={dialogs.mapActionsMenuVisible}
        onPress={(name) => {
          props.dialogClickHandler('mapActionsMenuVisible', name);
          toggleDialog('mapActionsMenuVisible')
        }}
        onTouchOutside={() => toggleDialog('mapActionsMenuVisible')}
      />
      <MapSymbolsDialog
        visible={dialogs.mapSymbolsMenuVisible}
        onPress={(name) => {
          props.dialogClickHandler('mapSymbolsMenuVisible', name);
          toggleDialog('mapSymbolsMenuVisible')
        }}
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
      {!currentImageBasemap && (
        <Animated.View style={[homeStyles.bottomLeftIcons, props.leftsideIconAnimation]}>
          <IconButton
            style={{top: 5}}
            source={buttons.userLocationButtonOn
              ? require('../../assets/icons/MyLocationButton_pressed.png')
              : require('../../assets/icons/MyLocationButton.png')}
            onPress={() => props.clickHandler('toggleUserLocation')}
          />
        </Animated.View>
      )}
      {currentImageBasemap && (
        <Animated.View style={[homeStyles.bottomLeftIcons, props.leftsideIconAnimation]}>
          <IconButton
            source={require('../../assets/icons/Close.png')}
            onPress={() => props.clickHandler('closeImageBasemap')}
          />
        </Animated.View>
      )}
    </React.Fragment>
  );
};

export default LeftSideButtons;
