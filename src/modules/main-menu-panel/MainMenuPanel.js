import React from 'react';
import {SafeAreaView, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import About from './About';
import Documentation from './Documentation';
import {MAIN_MENU_ITEMS} from './mainMenu.constants';
import {setMenuSelectionPage} from './mainMenuPanel.slice';
import styles from './mainMenuPanel.styles';
import MainMenuPanelHeader from './MainMenuPanelHeader';
import MainMenuPanelList from './MainMenuPanelList';
import {isEmpty} from '../../shared/Helpers';
import {shortcutSwitchPosition} from '../home/home.slice';
import ImageGallery from '../images/ImageGallery';
import CustomMapsMenu from '../maps/custom-maps/ManageCustomMaps';
import ImageBasemaps from '../maps/ImageBasemaps';
import ManageOfflineMapsMenu from '../maps/offline-maps/ManageOfflineMaps';
import StratSectionsList from '../maps/strat-section/StratSectionsList';
import Miscellaneous from '../preferences/Miscellaneous';
import NamingConventions from '../preferences/naming-conventions/NamingConventions';
import ShortcutMenu from '../preferences/shortcuts-menu/ShortcutsMenu';
import ActiveProject from '../project/ActiveProjectPanel';
import MyStraboSpot from '../project/MyStraboSpot';
import UploadBackupAndExport from '../project/UploadBackupExport';
import SamplesMenuItem from '../samples/SamplesMenuItem';
import {SpotsList} from '../spots';
import Tags from '../tags/Tags';

const MainMenuPanel = ({
                         closeMainMenuPanel,
                         logout,
                         openNotebookPanel,
                         openSpotInNotebook,
                         toggleHomeDrawer,
                         zoomToCenterOfflineTile,
                         zoomToCustomMap,
                       }) => {
  console.log('Rendering MainMenuPanel...');

  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const settingsPageVisible = useSelector(state => state.mainMenu.mainMenuPageVisible);
  const switchPosition = useSelector(state => state.home.shortcutSwitchPosition);

  const mainMenuHeader = (
    <MainMenuPanelHeader
      onPress={() => dispatch(setMenuSelectionPage({name: undefined}))}>
      {settingsPageVisible}
    </MainMenuPanelHeader>
  );
  let page;

  const setVisibleMenu = (name) => {
    if (name === MAIN_MENU_ITEMS.HELP.CLOSE_MENU) toggleHomeDrawer();
    else dispatch(setMenuSelectionPage({name: name}));
  };

  const toggleSwitch = (switchName) => {
    console.log('Switch', switchName);
    dispatch(shortcutSwitchPosition({switchName: switchName}));
    console.log(shortcutSwitchPosition);
  };

  switch (settingsPageVisible) {
    case MAIN_MENU_ITEMS.MANAGE.MY_STRABOSPOT:
      page = (
        <View style={styles.mainMenuContainer}>
          <MyStraboSpot logout={logout}/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS:
      page = (
        <View style={styles.mainMenuContainer}>
          <ActiveProject
            title={!isEmpty(project) && project.description ? project.description.project_name : 'Un-named'}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT:
      page = (
        <View style={styles.mainMenuContainer}>
          <UploadBackupAndExport closeMainMenuPanel={closeMainMenuPanel}/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.ATTRIBUTES.SPOTS_LIST:
      page = (
        <View style={styles.mainMenuContainer}>
          <SpotsList onPress={openSpotInNotebook}/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.ATTRIBUTES.IMAGE_GALLERY:
      page = (
        <View style={styles.mainMenuContainer}>
          <ImageGallery openSpotInNotebook={openSpotInNotebook}/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.ATTRIBUTES.SAMPLES:
      page = (
        <View style={styles.mainMenuContainer}>
          <SamplesMenuItem
            openSpotInNotebook={openSpotInNotebook}
            openNotebookPanel={notebookPage => openNotebookPanel(notebookPage)}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.ATTRIBUTES.GEOLOGIC_UNITS:
      page = (
        <View style={styles.mainMenuContainer}>
          <Tags type={'geologic_unit'}/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.ATTRIBUTES.TAGS:
      page = (
        <View style={styles.mainMenuContainer}>
          <Tags/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MAPS.CUSTOM:
      page = (
        <View style={styles.mainMenuContainer}>
          <CustomMapsMenu
            zoomToCustomMap={zoomToCustomMap}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MAPS.IMAGE_BASEMAPS :
      page = (
        <View style={styles.mainMenuContainer}>
          <ImageBasemaps/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MAPS.STRAT_SECTIONS :
      page = (
        <View style={styles.mainMenuContainer}>
          <StratSectionsList/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MAPS.MANAGE_OFFLINE_MAPS:
      page = (
        <View style={styles.mainMenuContainer}>
          <ManageOfflineMapsMenu
            closeMainMenuPanel={closeMainMenuPanel}
            zoomToCenterOfflineTile={zoomToCenterOfflineTile}/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.PREFERENCES.SHORTCUTS:
      page = (
        <View style={styles.mainMenuContainer}>
          <ShortcutMenu
            toggleSwitch={switchName => toggleSwitch(switchName)}
            shortcutSwitchPosition={switchPosition}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.PREFERENCES.NAMING_CONVENTIONS:
      page = (
        <View style={styles.mainMenuContainer}>
          <NamingConventions/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.PREFERENCES.MISCELLANEOUS:
      page = (
        <Miscellaneous/>
      );
      break;
    case MAIN_MENU_ITEMS.HELP.ABOUT:
      page = (
        <View style={styles.mainMenuContainer}>
          <About/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.HELP.DOCUMENTATION:
      page = (
        <View style={styles.mainMenuContainer}>
          <Documentation/>
        </View>
      );
      break;
    default:
      page = (
        <React.Fragment>
          <MainMenuPanelList
            onPress={name => setVisibleMenu(name)}
            activeProject={!isEmpty(project) && project.description ? project.description.project_name
              : 'No Active Project'}
          />
        </React.Fragment>
      );
  }

  return (
    <SafeAreaView style={{flex: 1}}>
    <View style={styles.container}>
      {mainMenuHeader}
      {page}
    </View>
    </SafeAreaView>
  );
};

export default MainMenuPanel;
