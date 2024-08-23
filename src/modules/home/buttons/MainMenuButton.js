import React from 'react';

import {useSelector} from 'react-redux';

import IconButton from '../../../shared/ui/IconButton';

const MainMenuButton = ({closeMainMenuPanel, openMainMenuPanel}) => {
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);

  const toggleHomeDrawer = () => {
    if (isMainMenuPanelVisible) closeMainMenuPanel();
    else openMainMenuPanel();
  };

  return (
    <IconButton
      source={isMainMenuPanelVisible
        ? require('../../../assets/icons/HomeButton_pressed.png')
        : require('../../../assets/icons/HomeButton.png')}
      onPress={toggleHomeDrawer}
    />
  );
};

export default MainMenuButton;
