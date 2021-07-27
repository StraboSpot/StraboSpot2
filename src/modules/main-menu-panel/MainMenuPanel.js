import React from 'react';
import {View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import {shortcutSwitchPosition} from '../home/home.slice';
import ImageGallery from '../images/ImageGallery';
import CustomMapsMenu from '../maps/custom-maps/ManageCustomMaps';
import ImageBaseMaps from '../maps/ImageBasemaps';
import ManageOfflineMapsMenu from '../maps/offline-maps/ManageOfflineMaps';
import {PAGE_KEYS} from '../page/page.constants';
import Miscellaneous from '../preferences/Miscellaneous';
import NamingConventions from '../preferences/naming-conventions/NamingConventions';
import ShortcutMenu from '../preferences/shortcuts-menu/ShortcutsMenu';
import ActiveProject from '../project/ActiveProjectPanel';
import MyStraboSpot from '../project/MyStraboSpot';
import UploadBackupAndExport from '../project/UploadBackupExport';
import SamplesMenuItem from '../samples/SamplesMenuItem';
import {SpotsList} from '../spots';
import {setSelectedAttributes, setSelectedSpot} from '../spots/spots.slice';
import Tags from '../tags/Tags';
import About from './About';
import {MAIN_MENU_ITEMS} from './mainMenu.constants';
import {setMenuSelectionPage} from './mainMenuPanel.slice';
import styles from './mainMenuPanel.styles';
import MainMenuPanelHeader from './MainMenuPanelHeader';
import MainMenuPanelList from './MainMenuPanelList';

const MainMenuPanel = props => {
  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const settingsPageVisible = useSelector(state => state.mainMenu.mainMenuPageVisible);
  const spotsInMapExtent = useSelector(state => state.map.spotsInMapExtent);
  const switchPosition = useSelector(state => state.home.shortcutSwitchPosition);

  const mainMenuHeader = (
    <MainMenuPanelHeader
      onPress={() => dispatch(setMenuSelectionPage({name: undefined}))}>
      {settingsPageVisible}
    </MainMenuPanelHeader>
  );
  let page;

  const openSpotInNotebook = (spot, notebookPage, attributes) => {
    dispatch(setSelectedSpot(spot));
    if (attributes) dispatch(setSelectedAttributes(attributes));
    if (notebookPage) props.openNotebookPanel(notebookPage);
    else props.openNotebookPanel(PAGE_KEYS.OVERVIEW);
  };

  const setVisibleMenu = (name) => {
    dispatch(setMenuSelectionPage({name: name}));
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
          <MyStraboSpot
            openSidePanel={props.openSidePanel}
            logout={props.logout}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS:
      page = (
        <View style={styles.mainMenuContainer}>
          <ActiveProject
            // openSidePanel={(view) => props.openSidePanel(view)}
            title={!isEmpty(project) && project.description ? project.description.project_name : 'Un-named'}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT:
      page = (
        <View style={styles.mainMenuContainer}>
          <UploadBackupAndExport closeMainMenuPanel={props.closeMainMenuPanel} openMainMenu={props.openMainMenu}/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.ATTRIBUTES.SPOTS_LIST:
      page = (
        <View style={styles.mainMenuContainer}>
          <SpotsList
            openSpotInNotebook={openSpotInNotebook}
            spotsInMapExtent={spotsInMapExtent}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.ATTRIBUTES.IMAGE_GALLERY:
      page = (
        <View style={styles.mainMenuContainer}>
          <ImageGallery
            openSpotInNotebook={openSpotInNotebook}
            spotsInMapExtent={spotsInMapExtent}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.ATTRIBUTES.SAMPLES:
      page = (
        <View style={styles.mainMenuContainer}>
          <SamplesMenuItem
            openSpotInNotebook={openSpotInNotebook}
            spotsInMapExtent={spotsInMapExtent}
            openNotebookPanel={(notebookPage) => props.openNotebookPanel(notebookPage)}
          />
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
            zoomToCustomMap={props.zoomToCustomMap}
            // openSidePanel={(view, map) => props.openSidePanel(view, map)}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MAPS.IMAGE_BASEMAPS :
      page = (
        <View style={styles.mainMenuContainer}>
          <ImageBaseMaps/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MAPS.MANAGE_OFFLINE_MAPS:
      page = (
        <View style={styles.mainMenuContainer}>
          <ManageOfflineMapsMenu
            closeMainMenuPanel={props.closeMainMenuPanel}
            zoomToCenterOfflineTile={props.zoomToCenterOfflineTile}/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.PREFERENCES.SHORTCUTS:
      page = (
        <View style={styles.mainMenuContainer}>
          <ShortcutMenu
            toggleSwitch={(switchName) => toggleSwitch(switchName)}
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
        <View style={[styles.mainMenuContainer, {alignItems: 'center', justifyContent: 'center'}]}>
          <About/>
        </View>
      );
      break;
    default:
      page = (
        <React.Fragment>
          <MainMenuPanelList
            onPress={(name) => setVisibleMenu(name)}
            activeProject={!isEmpty(project) && project.description ? project.description.project_name
              : 'No Active Project'}
          />
        </React.Fragment>
      );
  }

  return (
    <View style={styles.container}>
      {mainMenuHeader}
      {page}
    </View>
  );
};

export default MainMenuPanel;
