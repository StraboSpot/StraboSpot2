import React, {useEffect, useState} from 'react';
import {Animated} from 'react-native';

import {useToast} from 'react-native-toast-notifications';
import {useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import homeStyles from './home.style';
import MapActionButtons from './MapActionButtons';

const LeftSideButtons = ({
                           clickHandler,
                           dialogClickHandler,
                           leftsideIconAnimation,
                           mapComponentRef,
                           toggleHomeDrawer,
                         }) => {

  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);

  const [userLocationButtonOn, setUserLocationButtonOn] = useState(false);

  const toast = useToast();

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
    toast.show('Geolocation turned off automatically to conserve battery.');
    console.log('Location timer cleared');
  };

  return (
    <React.Fragment>
      <Animated.View style={[homeStyles.homeIconContainer, leftsideIconAnimation]}>
        <IconButton
          source={isMainMenuPanelVisible
            ? require('../../assets/icons/HomeButton_pressed.png')
            : require('../../assets/icons/HomeButton.png')}
          onPress={toggleHomeDrawer}
        />
      </Animated.View>
      <Animated.View style={[leftsideIconAnimation]}>
        <MapActionButtons
          dialogClickHandler={dialogClickHandler}
          mapComponentRef={mapComponentRef}
        />
      </Animated.View>
      <Animated.View style={[homeStyles.bottomLeftIcons, leftsideIconAnimation]}>
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
      </Animated.View>
    </React.Fragment>
  );
};

export default LeftSideButtons;
