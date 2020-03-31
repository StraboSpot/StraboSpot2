import React from 'react';
import {Alert, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {homeReducers} from './home.constants';
import NetInfo from '@react-native-community/netinfo';
import {spotReducers} from '../spots/spot.constants';
import {SettingsMenuItems} from '../main-menu-panel/mainMenu.constants';
import {notebookReducers} from '../notebook-panel/notebook.constants';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {isEmpty} from '../../shared/Helpers';


const useHome = (props) => {
  const dispatch = useDispatch();
  const getCurrentProject = useSelector(state => state.project.project);

  const checkForOpenProject = () => {
    console.log('Check for open project');
    return isEmpty(getCurrentProject);
  };

  const getOnlineStatus = () => {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        dispatch({type: homeReducers.SET_ISONLINE, online: state.isConnected});
        console.log('Is Online')
      }
      else if (state.isConnected) Alert.alert(state.isConnected.toString());
    });
  };

  const initializeHomePage = async () => {
    dispatch({type: homeReducers.SET_LOADING, bool: false});
    dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
    dispatch({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: false});
    dispatch({type: homeReducers.SET_ALLSPOTS_PANEL_VISIBLE, value: false});
    dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, value: false});
    dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: null});
    dispatch({type: homeReducers.SET_SETTINGS_PANEL_VISIBLE, value: false});
    dispatch({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: SettingsMenuItems.SETTINGS_MAIN});
    getOnlineStatus();
    return checkForOpenProject();
  };

  const toggleLoading = bool => {
    dispatch({type: homeReducers.SET_LOADING, bool: bool})
  };

  return [{
    checkForOpenProject: checkForOpenProject,
    getOnlineStatus: getOnlineStatus,
    initializeHomePage: initializeHomePage,
    toggleLoading: toggleLoading,
  }];
};

export default useHome;
