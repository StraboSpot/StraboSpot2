import {Platform} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import {isEmpty} from '../../shared/Helpers';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {doesBackupDirectoryExist} from '../project/projects.slice';
import {clearedSelectedSpots} from '../spots/spots.slice';
import {
  clearedStatusMessages,
  setLoadingStatus,
  setAllSpotsPanelVisible,
  setModalVisible,
  setMainMenuPanelVisible,
  setStatusMessagesModalVisible,
} from './home.slice';

const useHome = (props) => {
  let dirs = RNFetchBlob.fs.dirs;
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectoryForDistributedBackups = '/StraboSpotProjects';

  const dispatch = useDispatch();
  const getCurrentProject = useSelector(state => state.project.project);

  const checkForOpenProject = () => {
    console.log('Check for open project');
    return isEmpty(getCurrentProject);
  };

  const initializeHomePage = async () => {
    dispatch(setLoadingStatus({view: 'home', bool: false}));
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
    dispatch(clearedSelectedSpots());
    dispatch(setAllSpotsPanelVisible(false));
    dispatch(setSidePanelVisible({value: false}));
    dispatch(setModalVisible({modal: null}));
    dispatch(setMainMenuPanelVisible(false));
    dispatch(setMenuSelectionPage({name: undefined}));
    dispatch(clearedStatusMessages());
    dispatch(setStatusMessagesModalVisible(false));
    return checkForOpenProject();
  };

  const toggleLoading = bool => {
    dispatch(setLoadingStatus({view: 'home', bool: bool}));
  };

  return [{
    checkForOpenProject: checkForOpenProject,
    initializeHomePage: initializeHomePage,
    toggleLoading: toggleLoading,
  }];
};

export default useHome;
