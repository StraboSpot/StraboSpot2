import React from 'react';
import {Animated} from 'react-native';

import {useSelector} from 'react-redux';

import {UserLocationButton, MapActionButtons} from './index';
import IconButton from '../../../shared/ui/IconButton';
import homeStyles from '../home.style';

const LeftSideButtons = ({
                           animateLeftSide,
                           clickHandler,
                           dialogClickHandler,
                           dialogs,
                           mapComponentRef,
                           toggleDialog,
                           toggleHomeDrawer,
                         }) => {
  console.log('Rendering LeftSideButtons...');

  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);

  return (
    <>
      <Animated.View style={[homeStyles.homeIconContainer, animateLeftSide]}>
        <IconButton
          source={isMainMenuPanelVisible
            ? require('../../../assets/icons/HomeButton_pressed.png')
            : require('../../../assets/icons/HomeButton.png')}
          onPress={toggleHomeDrawer}
        />
      </Animated.View>

      <Animated.View style={[homeStyles.mapActionsContainer, animateLeftSide]}>
        <MapActionButtons
          dialogClickHandler={dialogClickHandler}
          dialogs={dialogs}
          mapComponentRef={mapComponentRef}
          toggleDialog={toggleDialog}
        />
      </Animated.View>

      <Animated.View style={[homeStyles.bottomLeftIcons, animateLeftSide]}>
        <UserLocationButton clickHandler={clickHandler}/>

        {currentImageBasemap && (
          <IconButton
            source={require('../../../assets/icons/Close.png')}
            onPress={() => clickHandler('closeImageBasemap')}
          />
        )}
        {stratSection && (
          <IconButton
            source={require('../../../assets/icons/Close.png')}
            onPress={() => clickHandler('closeStratSection')}
          />
        )}
      </Animated.View>
    </>
  );
};

export default LeftSideButtons;
