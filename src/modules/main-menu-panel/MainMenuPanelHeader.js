import React from 'react';
import {Text, View} from 'react-native';

import {Icon} from '@rn-vui/base';
import {useDispatch, useSelector} from 'react-redux';

import {MAIN_MENU_TITLE} from './mainMenu.constants';
import {setMenuSelectionPage} from './mainMenuPanel.slice';
import mainMenuPanelStyles from './mainMenuPanel.styles';

const MainMenuPanelHeader = ({onPress}) => {
  const dispatch = useDispatch();

  const settingsPageVisible = useSelector(state => state.mainMenu.mainMenuPageVisible);
  const isSideMenuVisible = useSelector(state => state.mainMenu.isSidePanelVisible);

  return (
    <View style={mainMenuPanelStyles.mainMenuHeaderContainer}>
      <View style={mainMenuPanelStyles.mainMenuIconContainer}>
        {settingsPageVisible && !isSideMenuVisible && (
          <Icon
            name={'arrow-back'}
            type={'ionicon'}
            color={'black'}
            iconStyle={mainMenuPanelStyles.buttons}
            onPress={() => dispatch(setMenuSelectionPage({name: null}))}
            size={30}
          />
        )}
      </View>
      <View style={mainMenuPanelStyles.mainMenuHeaderTextContainer}>
        <Text style={mainMenuPanelStyles.headerText}>{settingsPageVisible || MAIN_MENU_TITLE}</Text>
      </View>
      <View style={{flex: 1, paddingBottom: 10}}/>
    </View>
  );
};

export default MainMenuPanelHeader;
