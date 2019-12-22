import React from 'react';
import {connect, useSelector} from 'react-redux';
import {View} from 'react-native';

import {homeReducers} from '../../views/home/Home.constants';
import {isEmpty} from '../../shared/Helpers';
import {NotebookPages} from '../notebook-panel/Notebook.constants';
import {settingPanelReducers} from './settingsPanel.constants';
import {SettingsMenuItems} from './SettingsMenu.constants';
import {spotReducers} from '../../spots/Spot.constants';
import ActiveProject from '../../project/ActiveProjectPanel.view';
import CustomMapsMenu from '../maps/Custom-Maps-Menu/CustomMapsMenu';
import ImageGallery from '../images/ImageGallery.view';
import ManageOfflineMapsMenu from '../maps/Manage-Offline-Maps-Menu/ManageOfflineMapsMenu';
import MyStraboSpot from '../../project/MyStraboSpot';
import ProjectList from '../../project/ProjectList';
import SamplesList from '../samples/SamplesList.view';
import SettingsPanelHeader from './SettingsPanelHeader';
import SettingsPanelList from './SettingsPanelList';
import ShortcutMenu from './shortcuts-menu/ShortcutsMenu';
import SpotsList from '../../spots/SpotsList';
import UploadBackupAndExport from '../../project/UploadBackupExport';

import styles from './SettingsPanelStyles';

const SettingsPanel = props => {
  let buttonTitle = null;
  const project = useSelector(state => state.project.project);
  let settingsPanelHeader = <SettingsPanelHeader
    onPress={() => props.setSettingsPanelPageVisible(SettingsMenuItems.SETTINGS_MAIN)}>
    {props.settingsPageVisible}
  </SettingsPanelHeader>;

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
    props.onShortcutSwitchChange(switchName);
    console.log(props.shortcutSwitchPosition);
  };

  if (isEmpty(props.userProfile)) buttonTitle = 'Sign In';
  else buttonTitle = 'Sign Out';

  switch (props.settingsPageVisible) {
    case SettingsMenuItems.MANAGE.MY_STRABOSPOT:
      page =
        <View style={styles.settingsPanelContainer}>
          {settingsPanelHeader}
          <MyStraboSpot/>
        </View>;
      break;
    case SettingsMenuItems.MANAGE.ACTIVE_PROJECTS:
      page =
        <View style={styles.settingsPanelContainer}>
          {settingsPanelHeader}
          <ActiveProject
          title={!isEmpty(project) ? project.description.project_name : null}
          />
        </View>;
      break;
    case SettingsMenuItems.MANAGE.UPLOAD_BACKUP_EXPORT:
      page =
        <View style={styles.settingsPanelContainer}>
          {settingsPanelHeader}
          <UploadBackupAndExport/>
      </View>
        break;
    case SettingsMenuItems.APP_PREFERENCES.SHORTCUTS:
      page =
        <View style={styles.settingsPanelContainer}>
          {settingsPanelHeader}
          <ShortcutMenu
            toggleSwitch={(switchName) => toggleSwitch(switchName)}
            shortcutSwitchPosition={props.shortcutSwitchPosition}
          />
        </View>;
      break;
    case SettingsMenuItems.MAPS.MANAGE_OFFLINE_MAPS:
      page =
        <View style={styles.settingsPanelContainer}>
          {settingsPanelHeader}
          <ManageOfflineMapsMenu/>
        </View>;
      break;
    case SettingsMenuItems.MAPS.CUSTOM:
      page =
        <View style={styles.settingsPanelContainer}>
          {settingsPanelHeader}
          <CustomMapsMenu/>
        </View>;
      break;
    case SettingsMenuItems.ATTRIBUTES.SPOTS_LIST:
      page =
        <View style={styles.listContainer}>
          {settingsPanelHeader}
          <SpotsList
            getSpotData={(spotId) => getSpotFromId(spotId)}
          />
        </View>;
      break;
    case SettingsMenuItems.ATTRIBUTES.IMAGE_GALLERY:
      page =
        <View style={styles.listContainer}>
          {settingsPanelHeader}
          <ImageGallery
            getSpotData={(spotId) => getSpotFromId(spotId)}
          />
        </View>;
      break;
    case SettingsMenuItems.ATTRIBUTES.SAMPLES:
      page =
        <View style={styles.listContainer}>
          {settingsPanelHeader}
          <SamplesList
            getSpotData={(spotId, page) => getSpotFromId(spotId, page)}
          />
        </View>;
      break;
    case SettingsMenuItems.PROJECT.SWITCH_PROJECT:
      page = <View style={styles.listContainer}>
        {settingsPanelHeader}
        <ProjectList/>
      </View>;
      break;
    default:
     page =
        <React.Fragment>
          <View style={styles.listContainer}>
            {settingsPanelHeader}
            <SettingsPanelList
              onPress={(name) => setVisibleMenu(name)}
              title={buttonTitle}
              activeProject={!isEmpty(project)  ? project.description.project_name : 'No Active Project'}
            />
          </View>
        </React.Fragment>;
  }

  return (
    <View style={styles.container}>
      {page}
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    settingsPageVisible: state.settingsPanel.settingsPageVisible,
    shortcutSwitchPosition: state.home.shortcutSwitchPosition,
    spots: state.spot.spots,
    userProfile: state.user.userData,
  };
};

const mapDispatchToProps = {
  setSettingsPanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  onShortcutSwitchChange: (switchName) => ({type: homeReducers.SHORTCUT_SWITCH_POSITION, switchName: switchName}),
  onSetSelectedSpot: (spot) => ({type: spotReducers.SET_SELECTED_SPOT, spot: spot}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPanel);
