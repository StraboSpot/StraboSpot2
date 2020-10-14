import {Platform} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';

import {isEmpty} from '../../shared/Helpers';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {projectReducers} from '../project/project.constants';
import {spotReducers} from '../spots/spot.constants';
import {
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

  const checkForDeviceBackupDir = () => {
    return RNFetchBlob.fs.isDir(devicePath + appDirectoryForDistributedBackups).then(res => {
      dispatch({type: projectReducers.BACKUP_DIRECTORY_EXISTS, bool: res});
      return Promise.resolve();
    });
  };

  const initializeHomePage = async () => {
    dispatch(setLoadingStatus({view: 'home', bool: false}));
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
    dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
    dispatch(setAllSpotsPanelVisible({bool: false}));
    dispatch(setSidePanelVisible({value: false}));
    dispatch(setModalVisible({modal: null}));
    dispatch(setMainMenuPanelVisible({bool: false}));
    dispatch(setMenuSelectionPage({name: undefined}));
    dispatch(setStatusMessagesModalVisible({bool: false}));
    // dispatch({type: redux.CLEAR_STORE});
    await checkForDeviceBackupDir();
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
