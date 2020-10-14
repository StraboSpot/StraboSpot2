import React from 'react';
import {View, Text} from 'react-native';

import {connect, useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import {shortcutSwitchPosition} from '../home/home.slice';
import ImageGallery from '../images/ImageGallery';
import CustomMapsMenu from '../maps/custom-maps/ManageCustomMaps';
import ImageBaseMaps from '../maps/ImageBasemaps';
import ManageOfflineMapsMenu from '../maps/offline-maps/ManageOfflineMaps';
import {NotebookPages} from '../notebook-panel/notebook.constants';
import NamingConventions from '../preferences/naming-conventions/NamingConventions';
import ShortcutMenu from '../preferences/shortcuts-menu/ShortcutsMenu';
import ActiveProject from '../project/ActiveProjectPanel';
import MyStraboSpot from '../project/MyStraboSpot';
import ProjectList from '../project/ProjectList';
import UploadBackupAndExport from '../project/UploadBackupExport';
import SamplesList from '../samples/SamplesList';
import {spotReducers} from '../spots/spot.constants';
import SpotsList from '../spots/SpotsList';
import Tags from '../tags/Tags';
import About from './About';
import {MAIN_MENU_ITEMS} from './mainMenu.constants';
import {mainMenuPanelReducers} from './mainMenuPanel.constants';
import styles from './mainMenuPanel.styles';
import MainMenuPanelHeader from './MainMenuPanelHeader';
import MainMenuPanelList from './MainMenuPanelList';

const MainMenuPanel = props => {
  let buttonTitle = null;
  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const switchPosition = useSelector(state => state.home.shortcutSwitchPosition);
  const spotsInMapExtent = useSelector(state => state.map.spotsInMapExtent);
  let mainMenuHeader = <MainMenuPanelHeader
    onPress={() => props.setSettingsPanelPageVisible(undefined)}>
    {props.settingsPageVisible}
  </MainMenuPanelHeader>;

  let page = null;

  const getSpotFromId = (spotId, page) => {
    const spot = props.spots[spotId];
    if (page === NotebookPages.SAMPLE) props.openNotebookPanel(NotebookPages.SAMPLE);
    else props.openNotebookPanel(NotebookPages.OVERVIEW);
    props.onSetSelectedSpot(spot);
  };

  const setVisibleMenu = (name) => {
    props.setSettingsPanelPageVisible(name);
  };

  const toggleSwitch = (switchName) => {
    console.log('Switch', switchName);
    dispatch(shortcutSwitchPosition({switchName: switchName}));
    console.log(shortcutSwitchPosition);
  };

  if (isEmpty(props.userProfile)) buttonTitle = 'Sign In';
  else buttonTitle = 'Sign Out';

  switch (props.settingsPageVisible) {
    case MAIN_MENU_ITEMS.MANAGE.MY_STRABOSPOT:
      page = (
        <View style={styles.mainMenuContainer}>
          <MyStraboSpot
            openSidePanel={props.openSidePanel}
            openHomePanel={props.openHomePanel}
            closeHomePanel={props.closeHomePanel}/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS:
      page = (
        <View style={styles.mainMenuContainer}>
          <ActiveProject
            // openSidePanel={(view) => props.openSidePanel(view)}
            title={!isEmpty(project) ? project.description.project_name : null}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT:
      page = (
        <View style={styles.mainMenuContainer}>
          <UploadBackupAndExport/>
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
    case MAIN_MENU_ITEMS.MAPS.MANAGE_OFFLINE_MAPS:
      page = (
        <View style={styles.mainMenuContainer}>
          <ManageOfflineMapsMenu/>
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MAPS.IMAGE_BASEMAPS :
      page = (
        <View style={styles.mainMenuContainer}>
          <ImageBaseMaps
            getSpotData={(spotId) => getSpotFromId(spotId)}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.MAPS.CUSTOM:
      page = (
        <View style={styles.mainMenuContainer}>
          <CustomMapsMenu
            // openSidePanel={(view, map) => props.openSidePanel(view, map)}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.ATTRIBUTES.SPOTS_LIST:
      page = (
        <View style={styles.mainMenuContainer}>
          <SpotsList
            getSpotData={(spotId) => getSpotFromId(spotId)}
            spotsInMapExtent={spotsInMapExtent}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.ATTRIBUTES.IMAGE_GALLERY:
      page = (
        <View style={styles.mainMenuContainer}>
          <ImageGallery
            getSpotData={(spotId) => getSpotFromId(spotId)}
          />
        </View>
      );
      break;
    case MAIN_MENU_ITEMS.ATTRIBUTES.SAMPLES:
      page = (
        <View style={styles.mainMenuContainer}>
          <SamplesList
            getSpotData={(spotId, page) => getSpotFromId(spotId, page)}
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
          <View style={styles.listContainer}>
            <MainMenuPanelList
              onPress={(name) => setVisibleMenu(name)}
              title={buttonTitle}
              activeProject={!isEmpty(project) ? project.description.project_name : 'No Active Project'}
            />
          </View>
        </React.Fragment>
      );
  }

  return (
    <View style={styles.container}>
      <View style={{flex: 1}}>
        {mainMenuHeader}
      </View>
      <View style={{flex: 10}}>
        {page}
      </View>
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    settingsPageVisible: state.mainMenu.mainMenuPageVisible,
    spots: state.spot.spots,
    userProfile: state.user.userData,
  };
};

const mapDispatchToProps = {
  setSettingsPanelPageVisible: (name) => ({type: mainMenuPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  onSetSelectedSpot: (spot) => ({type: spotReducers.SET_SELECTED_SPOT, spot: spot}),
};

export default connect(mapStateToProps, mapDispatchToProps)(MainMenuPanel);
