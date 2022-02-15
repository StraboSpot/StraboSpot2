import React, {useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

import {useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import ToastPopup from '../../shared/ui/Toast';
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
  const stratSection = useSelector(state => state.map.stratSection);

  const [dialogs, setDialogs] = useState({
    mapActionsMenuVisible: false,
    mapSymbolsMenuVisible: false,
    baseMapMenuVisible: false,
  });
  const [userLocationButtonOn, setUserLocationButtonOn] = useState(false);

  const toastRef = useRef(null);

  let timeout;

  useEffect(() => {
    console.log('User Location button is:', userLocationButtonOn);
    if (userLocationButtonOn) startLocationReminderTimer();
    return () => clearTimeout(timeout);
  }, [userLocationButtonOn]);

  // Toggle given dialog between true (visible) and false (hidden)
  const toggleDialog = dialog => {
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
    props.clickHandler('toggleUserLocation', false);
    toastRef.current.show('Geolocation turned off automatically to conserve battery.');
    console.log('Location timer cleared');
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
        {!currentImageBasemap && !stratSection && (
          <IconButton
            source={require('../../assets/icons/LayersButton.png')}
            onPress={() => toggleDialog('baseMapMenuVisible')}
          />
        )}
      </Animated.View>
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
        onPress={(name) => {
          props.dialogClickHandler('mapSymbolsMenuVisible', name);
          toggleDialog('mapSymbolsMenuVisible');
        }}
        onTouchOutside={() => toggleDialog('mapSymbolsMenuVisible')}
      />
      <BaseMapDialog
        visible={dialogs.baseMapMenuVisible}
        close={() => toggleDialog('baseMapMenuVisible')}
        zoomToCustomMap={props.zoomToCustomMap}
        zoomToCenterOfflineTile={props.zoomToCenterOfflineTile}
        onPress={(name) => {
          useMaps.setBasemap(name);
          toggleDialog('baseMapMenuVisible');
        }}
        onTouchOutside={() => toggleDialog('baseMapMenuVisible')}
      />
      {!currentImageBasemap && !stratSection && (
        <Animated.View style={[homeStyles.bottomLeftIcons, props.leftsideIconAnimation]}>
          <IconButton
            style={{top: 5}}
            source={userLocationButtonOn
              ? require('../../assets/icons/MyLocationButton_pressed.png')
              : require('../../assets/icons/MyLocationButton.png')}
            onPress={() => {
              setUserLocationButtonOn(!userLocationButtonOn);
              props.clickHandler('toggleUserLocation', !userLocationButtonOn);
            }}
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
      {stratSection && (
        <Animated.View style={[homeStyles.bottomLeftIcons, props.leftsideIconAnimation]}>
          <IconButton
            source={require('../../assets/icons/Close.png')}
            onPress={() => props.clickHandler('closeStratSection')}
          />
        </Animated.View>
      )}
      <ToastPopup
        toastRef={toastRef}
        positionValue={50}
        style={{backgroundColor: 'lightyellow'}}
      />
    </React.Fragment>
  );
};

export default LeftSideButtons;
