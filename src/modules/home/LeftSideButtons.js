import React, {useEffect, useState} from 'react';
import {Animated} from 'react-native';

import {useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import UseMapsHook from '../maps/useMaps';
import BaseMapDialog from './BaseMapDialogBox';
import homeStyles from './home.style';
import MapActionsDialog from './MapActionsDialogBox';
import MapSymbolsDialog from './MapSymbolsDialogBox';
import overlayStyles from './overlay.styles';

const LeftSideButtons = ({clickHandler, dialogClickHandler, leftSideIconAnimation, toast, toggleHomeDrawer, zoomToCustomMap, zoomToCenterOfflineTile}) => {

  const [useMaps] = UseMapsHook();
  const isAllSymbolsOn = useSelector(state => state.map.isAllSymbolsOn);
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);

  const [dialogs, setDialogs] = useState({
    mapActionsMenuVisible: false,
    mapSymbolsMenuVisible: false,
    baseMapMenuVisible: false,
  });
  const [userLocationButtonOn, setUserLocationButtonOn] = useState(false);

  let timeout;

  useEffect(() => {
    console.log('UE LeftSideButtons [userLocationButtonOn]', userLocationButtonOn);
    if (userLocationButtonOn) startLocationReminderTimer();
    return () => clearTimeout(timeout);
  }, [userLocationButtonOn]);

  // Toggle given dialog between true (visible) and false (hidden)
  const toggleDialog = (dialog) => {
    console.log('Toggle', dialog);
    setDialogs(d => ({...d, [dialog]: !d[dialog]}));
    console.log(dialog, 'is set to', dialogs[dialog]);
  };

  const startLocationReminderTimer = () => {
    timeout = setTimeout(() => {
      console.log(timeout);
      clearLocationTimer();
    }, 60000);
  };

  const clearLocationTimer = () => {
    setUserLocationButtonOn(false);
    clickHandler('toggleUserLocation', false);
    toast('Geolocation turned off automatically to conserve battery.');
    console.log('Location timer cleared');
  };

  return (
    <React.Fragment>
      <Animated.View style={[homeStyles.homeIconContainer, leftSideIconAnimation]}>
        <IconButton
          source={isMainMenuPanelVisible
            ? require('../../assets/icons/HomeButton_pressed.png')
            : require('../../assets/icons/HomeButton.png')}
          onPress={() => toggleHomeDrawer()}
        />
      </Animated.View>
      <Animated.View style={[homeStyles.leftsideIcons, leftSideIconAnimation]}>
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
        {!currentImageBasemap && !stratSection && (
          <IconButton
            source={require('../../assets/icons/LayersButton.png')}
            onPress={() => toggleDialog('baseMapMenuVisible')}
          />
        )}
      </Animated.View>
      <MapActionsDialog
        visible={dialogs.mapActionsMenuVisible}
        overlayStyle={overlayStyles.mapActionsPosition}
        onPress={(name) => {
          dialogClickHandler('mapActionsMenuVisible', name);
          toggleDialog('mapActionsMenuVisible');
        }}
        onTouchOutside={() => toggleDialog('mapActionsMenuVisible')}
      />
      <MapSymbolsDialog
        visible={dialogs.mapSymbolsMenuVisible}
        overlayStyle={overlayStyles.mapSymbolsPosition}
        onPress={(name) => {
          dialogClickHandler('mapSymbolsMenuVisible', name);
          toggleDialog('mapSymbolsMenuVisible');
        }}
        onTouchOutside={() => toggleDialog('mapSymbolsMenuVisible')}
      />
      <BaseMapDialog
        visible={dialogs.baseMapMenuVisible}
        overlayStyle={overlayStyles.baseMapPosition}
        close={() => toggleDialog('baseMapMenuVisible')}
        zoomToCustomMap={zoomToCustomMap}
        zoomToCenterOfflineTile={zoomToCenterOfflineTile}
        onPress={(name) => {
          useMaps.setBasemap(name);
          toggleDialog('baseMapMenuVisible');
        }}
        onTouchOutside={() => toggleDialog('baseMapMenuVisible')}
      />
      {!currentImageBasemap && !stratSection && (
        <Animated.View style={[homeStyles.bottomLeftIcons, leftSideIconAnimation]}>
          <IconButton
            style={{top: 5}}
            source={userLocationButtonOn
              ? require('../../assets/icons/MyLocationButton_pressed.png')
              : require('../../assets/icons/MyLocationButton.png')}
            onPress={() => {
              setUserLocationButtonOn(!userLocationButtonOn);
              clickHandler('toggleUserLocation', !userLocationButtonOn);
            }}
          />
        </Animated.View>
      )}
      {currentImageBasemap && (
        <Animated.View style={[homeStyles.bottomLeftIcons, leftSideIconAnimation]}>
          <IconButton
            source={require('../../assets/icons/Close.png')}
            onPress={() => clickHandler('closeImageBasemap')}
          />
        </Animated.View>
      )}
      {stratSection && (
        <Animated.View style={[homeStyles.bottomLeftIcons, leftSideIconAnimation]}>
          <IconButton
            source={require('../../assets/icons/Close.png')}
            onPress={() => clickHandler('closeStratSection')}
          />
        </Animated.View>
      )}
    </React.Fragment>
  );
};

export default LeftSideButtons;
