import React from 'react';
import {Text, View} from 'react-native';

import {Icon} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {MAIN_MENU_TITLE} from './mainMenu.constants';
import {setMenuSelectionPage} from './mainMenuPanel.slice';
import mainMenuPanelStyles from './mainMenuPanel.styles';

const MainMenuPanelHeader = ({closeMainMenuPanel}) => {
  const dispatch = useDispatch();

  const settingsPageVisible = useSelector(state => state.mainMenu.mainMenuPageVisible);
  const isSideMenuVisible = useSelector(state => state.mainMenu.isSidePanelVisible);

  return (
    <View style={mainMenuPanelStyles.mainMenuHeaderContainer}>
      {settingsPageVisible && !isSideMenuVisible ? (
        <View style={mainMenuPanelStyles.mainMenuIconContainer}>
          <Icon
            name={'arrow-back'}
            type={'ionicon'}
            color={'black'}
            iconStyle={mainMenuPanelStyles.buttons}
            onPress={() => dispatch(setMenuSelectionPage({name: null}))}
            size={30}
          />
        </View>
      ) : <View style={mainMenuPanelStyles.mainMenuIconContainer}/>}
      <View style={mainMenuPanelStyles.mainMenuHeaderTextContainer}>
        <Text style={mainMenuPanelStyles.headerText}>{settingsPageVisible || MAIN_MENU_TITLE}</Text>
      </View>
      <View style={{padding: 5, justifyContent: 'flex-start'}}>
        <Icon
          name={'close'}
          type={'ionicon'}
          color={'black'}
          onPress={closeMainMenuPanel}
          size={30}
        />
      </View>
    </View>
  );
};

export default MainMenuPanelHeader;
