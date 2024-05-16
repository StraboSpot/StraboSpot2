import React, {useEffect, useRef, useState} from 'react';
import {Animated, Keyboard, Platform, TextInput} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {useDispatch, useSelector} from 'react-redux';

import {
  addedStatusMessage,
  clearedStatusMessages,
  setLoadingStatus,
  setMainMenuPanelVisible,
  setModalVisible,
  setProjectLoadSelectionModalVisible,
} from './home.slice';
import homeStyles from './home.style';
import HomeMiddle from './HomeMiddle';
import {
  BackupModal,
  ErrorModal,
  InitialProjectLoadModal,
  StatusModal,
  UploadModal,
  UploadProgressModal,
  WarningModal,
} from './modals';
import useDeviceHook from '../../services/useDevice';
import useExportHook from '../../services/useExport';
import VersionCheckHook from '../../services/versionCheck/useVersionCheck';
import * as Helpers from '../../shared/Helpers';
import {animateDrawer} from '../../shared/Helpers';
import {MAIN_MENU_DRAWER_WIDTH, NOTEBOOK_DRAWER_WIDTH, SMALL_SCREEN} from '../../shared/styles.constants';
import LoadingSpinner from '../../shared/ui/Loading';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {setNotebookPageVisible, setNotebookPanelVisible} from '../notebook-panel/notebook.slice';
import {MODAL_KEYS, PAGE_KEYS} from '../page/page.constants';
import {logout} from '../user/userProfile.slice';

const {State: TextInputState} = TextInput;

const Home = ({navigation, route}) => {
  console.log('Rendering Home...');

  const useDevice = useDeviceHook();
  const useExport = useExportHook();
  const useVersionCheck = VersionCheckHook();

  const dispatch = useDispatch();
  const backupFileName = useSelector(state => state.project.backupFileName);
  const isHomeLoading = useSelector(state => state.home.loading.home);
  const isMainMenuPanelVisible = useSelector(state => state.home.isMainMenuPanelVisible);
  const isProjectLoadSelectionModalVisible = useSelector(state => state.home.isProjectLoadSelectionModalVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedProject = useSelector(state => state.project.selectedProject);
  const userEmail = useSelector(state => state.user.email);
  const userName = useSelector(state => state.user.name);

  const [dialogs, setDialogs] = useState(
    {mapActionsMenuVisible: false, mapSymbolsMenuVisible: false, baseMapMenuVisible: false});
  const [showUpdateLabel, setShowUpdateLabel] = useState(false);

  const animatedValueLeftSide = useRef(new Animated.Value(0)).current;
  const animatedValueMainMenuDrawer = useRef(new Animated.Value(-MAIN_MENU_DRAWER_WIDTH)).current;
  const animatedValueNotebookDrawer = useRef(new Animated.Value(NOTEBOOK_DRAWER_WIDTH)).current;
  const animatedValueRightSide = useRef(new Animated.Value(0)).current;
  const animatedValueTextInputs = useRef(new Animated.Value(0)).current;

  const animateTextInputs = {transform: [{translateY: animatedValueTextInputs}]};

  useEffect(() => {
    Platform.OS !== 'web' && useDevice.createProjectDirectories().catch(
      err => console.error('Error creating app directories', err));
  }, []);

  useEffect(() => {
    let updateTimer;
    if (!isProjectLoadSelectionModalVisible && Platform.OS !== 'web') {
      useVersionCheck.checkAppStoreVersion().then((res) => {
        if (res.needsUpdate) {
          setShowUpdateLabel(true);
          updateTimer = setTimeout(() => setShowUpdateLabel(false), 5000);
        }
      });
    }
    return () => {
      clearTimeout(updateTimer);
    };
  }, []);

  useEffect(() => {
    console.log('UE Home', '[navigation, route.params]', route.params);
    const unsubscribe = navigation.addListener('focus', () => {
      route?.params?.pageKey === 'overview' && openNotebookPanel(route.params.pageKey);
    });
    return () => {
      console.log('Navigation Unsubscribed');
      return unsubscribe;
    };
  }, [navigation, route.params]);

  useEffect(() => {
    console.log('UE Home [user]', userEmail);
    if (userEmail && userName) {
      Sentry.configureScope((scope) => {
        scope.setUser({'email': userEmail, 'username': userName});
      });
    }
  }, [userEmail, userName]);

  useEffect(() => {
    console.log('UE Home [modalVisible]', modalVisible);
    if (Platform.OS === 'ios') {
      Keyboard.addListener('keyboardDidShow', handleKeyboardDidShowHome);
      Keyboard.addListener('keyboardDidHide', handleKeyboardDidHideHome);
      console.log('Keyboard listeners added to HOME');
      return function cleanup() {
        Keyboard.addListener('keyboardDidShow', handleKeyboardDidShowHome).remove();
        Keyboard.addListener('keyboardDidHide', handleKeyboardDidHideHome).remove();
        console.log('Home Keyboard Listeners Removed');
      };
    }
  }, [modalVisible]);

  const closeInitialProjectLoadModal = () => {
    console.log('Starting Project...');
    dispatch(setProjectLoadSelectionModalVisible(false));
  };

  const closeMainMenu = () => {
    dispatch(setMainMenuPanelVisible(false));
    dispatch(setMenuSelectionPage({name: null}));
    SMALL_SCREEN && dispatch(setSidePanelVisible(false));
    animateDrawer(animatedValueMainMenuDrawer, -MAIN_MENU_DRAWER_WIDTH);
    animateDrawer(animatedValueLeftSide, 0);
  };

  const closeNotebookPanel = () => {
    console.log('Closing Notebook...');
    animateDrawer(animatedValueNotebookDrawer, NOTEBOOK_DRAWER_WIDTH);
    animateDrawer(animatedValueRightSide, 0);
    dispatch(setNotebookPanelVisible(false));
    if (modalVisible && !Object.keys(MODAL_KEYS.SHORTCUTS).find(s => s.key === modalVisible)) {
      dispatch(setModalVisible({modal: null}));
    }
  };

  const exportProject = async () => {
    const exportCompleteMessage = Platform.OS === 'ios' ? `\n\nProject (${backupFileName}) has been exported!`
      : `\n\nProject (${selectedProject.project.fileName}) has been exported to the Downloads folder!`;

    dispatch(clearedStatusMessages());
    console.log('Exporting Project');
    dispatch(addedStatusMessage(`Exporting ${backupFileName}!`));
    await useExport.zipAndExportProjectFolder(true);
    dispatch(addedStatusMessage(exportCompleteMessage));
    dispatch(setLoadingStatus({view: 'modal', bool: false}));
    console.log(`Project ${backupFileName} has been exported!`);
  };

  const handleKeyboardDidShowHome = event => Helpers.handleKeyboardDidShow(event, TextInputState,
    animatedValueTextInputs);

  const handleKeyboardDidHideHome = () => Helpers.handleKeyboardDidHide(animatedValueTextInputs);

  const onLogout = () => {
    toggleHomeDrawerButton();
    closeNotebookPanel();
    dispatch(logout());
  };

  const openMainMenu = () => {
    dispatch(setMainMenuPanelVisible(true));
    animateDrawer(animatedValueMainMenuDrawer, 0);
    animateDrawer(animatedValueLeftSide, MAIN_MENU_DRAWER_WIDTH);
  };

  const openNotebookPanel = (pageView) => {
    console.log('Opening Notebook', pageView, '...');
    if (modalVisible !== MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS) dispatch(setModalVisible({modal: null}));
    dispatch(setNotebookPageVisible(pageView || PAGE_KEYS.OVERVIEW));
    dispatch(setNotebookPanelVisible(true));
    animateDrawer(animatedValueNotebookDrawer, 0);
    animateDrawer(animatedValueRightSide, -NOTEBOOK_DRAWER_WIDTH);
    if (SMALL_SCREEN) {
      navigation.navigate('HomeScreen', {screen: 'Notebook'});
      closeMainMenu();
    }
  };

  const openStraboSpotURL = () => useDevice.openURL('https://www.strabospot.org/login');

  // Toggle given dialog between true (visible) and false (hidden)
  const toggleDialog = (dialog) => {
    console.log('Toggle', dialog);
    setDialogs({...dialogs, [dialog]: !dialogs[dialog]});
    console.log(dialog, 'is set to', dialogs[dialog]);
  };

  const toggleHomeDrawerButton = () => {
    if (isMainMenuPanelVisible) closeMainMenu();
    else openMainMenu();
  };

  return (
    <Animated.View style={[homeStyles.container, animateTextInputs]}>
      <HomeMiddle
        animatedValueLeftSide={animatedValueLeftSide}
        animatedValueMainMenuDrawer={animatedValueMainMenuDrawer}
        animatedValueNotebookDrawer={animatedValueNotebookDrawer}
        animatedValueRightSide={animatedValueRightSide}
        closeNotebookPanel={closeNotebookPanel}
        dialogs={dialogs}
        isMainMenuPanelVisible={isMainMenuPanelVisible}
        onLogout={onLogout}
        openNotebookPanel={openNotebookPanel}
        showUpdateLabel={showUpdateLabel}
        toggleDialog={toggleDialog}
        toggleHomeDrawerButton={toggleHomeDrawerButton}
      />
      {/*Modals for Home Page*/}
      <BackupModal/>
      {/*<BackUpOverwriteModal onPress={action => useProject.switchProject(action)}/>*/}
      {isProjectLoadSelectionModalVisible && Platform.OS !== 'web' && (
        <InitialProjectLoadModal
          closeModal={closeInitialProjectLoadModal}
          logout={onLogout}
          openMainMenu={toggleHomeDrawerButton}
          visible={isProjectLoadSelectionModalVisible}
        />
      )}
      <ErrorModal/>
      <StatusModal
        exportProject={exportProject}
        openMainMenu={!isMainMenuPanelVisible && toggleHomeDrawerButton}
        openUrl={openStraboSpotURL}
      />
      <UploadModal toggleHomeDrawer={toggleHomeDrawerButton}/>
      <UploadProgressModal/>
      <WarningModal/>
      {/*------------------------*/}
      <LoadingSpinner isLoading={isHomeLoading}/>
    </Animated.View>
  );
};

export default Home;
