import React from 'react';
import {View} from 'react-native';
import {connect, useSelector} from 'react-redux';
import styles from './SettingsPanelStyles';
import SettingsPanelList from './SettingsPanelList';
import SettingsPanelHeader from './SettingsPanelHeader';
import {SettingsMenuItems} from './SettingsMenu.constants';
import MyStraboSpot from '../../project/MyStraboSpot';
import ActiveProject from '../../project/ActiveProjectPanel.view';
import UploadBackupAndExport from '../../project/UploadBackupExport';
import SpotsList from '../../spots/SpotsList';
import ImageGallery from '../images/ImageGallery.view';
import SamplesList from '../samples/SamplesList.view';
import ShortcutMenu from './shortcuts-menu/ShortcutsMenu';
import ManageOfflineMapsMenu from '../maps/Manage-Offline-Maps-Menu/ManageOfflineMapsMenu';
import CustomMapsMenu from '../maps/Custom-Maps-Menu/CustomMapsMenu';
import {homeReducers} from '../../views/home/Home.constants';
import {settingPanelReducers} from './settingsPanel.constants';
import {spotReducers} from '../../spots/Spot.constants';
import {NotebookPages} from '../notebook-panel/Notebook.constants';
import {USER_DATA} from '../../services/user/User.constants';
import {isEmpty} from '../../shared/Helpers';
import ProjectList from '../../project/ProjectList';

const SettingsPanel = props => {
  let buttonTitle = null;
  const project = useSelector(state => state.project.project);
  const {settingsPageVisible, setSettingsPanelPageVisible} = props;
  let settingsPanelHeader = <SettingsPanelHeader
    onPress={() => setSettingsPanelPageVisible(SettingsMenuItems.SETTINGS_MAIN)}>
    {settingsPageVisible}
  </SettingsPanelHeader>;

  let page = null;

  const getSpotFromId = (spotId, page) => {
    const spotID = props.spot.find(spot => {
      return spot.properties.id === spotId;
    });
    if (page === NotebookPages.SAMPLE) {
      props.openNotebookPanel(NotebookPages.SAMPLE);
    }
    else props.openNotebookPanel(NotebookPages.OVERVIEW);
    props.onFeatureSelected(spotID);
  };

  const setVisibleMenu = (name) => {
    setSettingsPanelPageVisible(name);
  };

  const toggleSwitch = (switchName) => {
    console.log('Switch', switchName);
    props.onShortcutSwitchChange(switchName);
    console.log(props.shortcutSwitchPosition);
  };

  if (isEmpty(props.userProfile)) buttonTitle = 'Sign In';
  else buttonTitle = 'Sign Out';

  switch (settingsPageVisible) {
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
    spot: state.spot.features,
    userProfile: state.user.userData,
  };
};

const mapDispatchToProps = {
  setSettingsPanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  onShortcutSwitchChange: (switchName) => ({type: homeReducers.SHORTCUT_SWITCH_POSITION, switchName: switchName}),
  onFeatureSelected: (featureSelected) => ({type: spotReducers.FEATURE_SELECTED, feature: featureSelected}),
  setUserData: (userData) => ({type: USER_DATA, userData: userData}),
  clearStorage: () => ({type: 'USER_LOGOUT'}),
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPanel);
