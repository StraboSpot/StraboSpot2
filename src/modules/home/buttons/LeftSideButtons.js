import React from 'react';
import {Animated, View} from 'react-native';

import {useSelector} from 'react-redux';

import {MainMenuButton, MapActionButtons, UserLocationButton} from './index';
import IconButton from '../../../shared/ui/IconButton';
import homeStyles from '../home.style';

const LeftSideButtons = ({
                           animateLeftSide,
                           clickHandler,
                           closeMainMenuPanel,
                           dialogClickHandler,
                           dialogs,
                           mapComponentRef,
                           openMainMenuPanel,
                           toggleDialog,
                         }) => {
  console.log('Rendering LeftSideButtons...');

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);

  return (
    <>
      <View style={[homeStyles.homeIconContainer, animateLeftSide]}>
        <MainMenuButton closeMainMenuPanel={closeMainMenuPanel} openMainMenuPanel={openMainMenuPanel}/>
      </View>

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
