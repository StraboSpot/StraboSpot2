import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import {useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import homeStyles from './home.style';
import MapActionButtons from './MapActionButtons';

const LeftSideButtons = ({
                           clickHandler,
                           dialogClickHandler,
                           dialogs,
                           toast,
                           mapComponentRef,
                           toggleDialog,
                           toggleHomeDrawer,
                         }) => {

  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);

  const [userLocationButtonOn, setUserLocationButtonOn] = useState(false);

  let timeout;

  useEffect(() => {
    console.log('UE LeftSideButtons [userLocationButtonOn]', userLocationButtonOn);
    if (userLocationButtonOn) startLocationReminderTimer();
    return () => clearTimeout(timeout);
  }, [userLocationButtonOn]);

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
    <>
      <IconButton
        source={isMainMenuPanelVisible
          ? require('../../assets/icons/HomeButton_pressed.png')
          : require('../../assets/icons/HomeButton.png')}
        onPress={toggleHomeDrawer}
        style={homeStyles.homeIconContainer}
      />

      <MapActionButtons
        dialogClickHandler={dialogClickHandler}
        dialogs={dialogs}
        mapComponentRef={mapComponentRef}
        toggleDialog={toggleDialog}
      />

      <View style={homeStyles.bottomLeftIcons}>
        {!currentImageBasemap && !stratSection && (
          <IconButton
            source={userLocationButtonOn
              ? require('../../assets/icons/MyLocationButton_pressed.png')
              : require('../../assets/icons/MyLocationButton.png')}
            onPress={() => {
              setUserLocationButtonOn(!userLocationButtonOn);
              clickHandler('toggleUserLocation', !userLocationButtonOn);
            }}
          />
        )}
        {currentImageBasemap && (
          <IconButton
            source={require('../../assets/icons/Close.png')}
            onPress={() => clickHandler('closeImageBasemap')}
          />
        )}
        {stratSection && (
          <IconButton
            source={require('../../assets/icons/Close.png')}
            onPress={() => clickHandler('closeStratSection')}
          />
        )}
      </View>
    </>
  );
};

export default LeftSideButtons;
