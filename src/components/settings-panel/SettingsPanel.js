import React, {useEffect} from 'react';
import {View} from 'react-native';
import {connect} from 'react-redux';
import styles from "./SettingsPanelStyles";
import SettingsPanelList from './SettingsPanelList';
import UserProfileComponent from './UserProfileComponent';
import SettingsPanelHeader from "./SettingsPanelHeader";
import {SettingsMenuItems} from "./SettingsMenu.constants";
import SpotsList from "../../spots/SpotsList";
import ImageGallery from "../images/ImageGallery.view";
import SamplesList from '../samples/SamplesList.view';
import ManageDatasets from '../../project/ManageDatasets';
import ShortcutMenu from "./shortcuts-menu/ShortcutsMenu";
import ManageOfflineMapsMenu from "../maps/Manage-Offline-Maps-Menu/ManageOfflineMapsMenu";
import CustomMapsMenu from "../maps/Custom-Maps-Menu/CustomMapsMenu";
import {homeReducers} from "../../views/home/Home.constants";
import {settingPanelReducers} from "./settingsPanel.constants";
import {spotReducers} from "../../spots/Spot.constants";
import {NotebookPages, notebookReducers} from "../notebook-panel/Notebook.constants";
import {goSignIn} from '../../routes/Navigation';
import {USER_DATA, USER_IMAGE, USER_DATA_CLEARED} from "../../services/user/User.constants";

const SettingsPanel = props => {
  const {settingsPageVisible, setSettingsPanelPageVisible} = props;
  let settingsPanelHeader = <SettingsPanelHeader
    onPress={() => setSettingsPanelPageVisible(SettingsMenuItems.SETTINGS_MAIN)}>
    {settingsPageVisible}
  </SettingsPanelHeader>;

  let page = null;

  useEffect(() => {
    setSettingsPanelPageVisible(SettingsMenuItems.SETTINGS_MAIN);
    console.log('PAGE:', settingsPageVisible)
  }, []);

  const getSpotFromId = (spotId, page) => {
    const spotID = props.spot.find(spot => {
      return spot.properties.id === spotId
    });
    if (page === NotebookPages.SAMPLE) {
      props.openNotebookPanel(NotebookPages.SAMPLE);
    } else props.openNotebookPanel(NotebookPages.OVERVIEW);
    props.onFeatureSelected(spotID);
  };

  const logout = () => {
    props.clearUserData();
    goSignIn();
  };

  const setVisibleMenu = (name) => {
    setSettingsPanelPageVisible(name);
  };

  const toggleSwitch = (switchName) => {
    console.log('Switch', switchName);
      props.onShortcutSwitchChange(switchName);
      console.log(props.shortcutSwitchPosition);
  };

  switch (settingsPageVisible) {
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
          <ManageOfflineMapsMenu />
        </View>;
      break;
    case SettingsMenuItems.MAPS.CUSTOM:
      page =
        <View style={styles.settingsPanelContainer}>
          {settingsPanelHeader}
          <CustomMapsMenu />
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
     case SettingsMenuItems.APP_PREFERENCES.MANAGE_DATASETS:
       page = <View>
         {settingsPanelHeader}
         <ManageDatasets/>
       </View>;
    break;
    default:
      page =
        <React.Fragment>
          <UserProfileComponent/>
          <View style={styles.listContainer}>
            <SettingsPanelList
              onPress={(name) => setVisibleMenu(name)}
              signout={() => logout()}
            />
          </View>
        </React.Fragment>
  }

  return(
    <View style={styles.container}>
      {page}
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    settingsPageVisible: state.settingsPanel.settingsPageVisible,
    shortcutSwitchPosition: state.home.shortcutSwitchPosition,
    spot: state.spot.features
  }
};

const mapDispatchToProps = {
  setSettingsPanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  onShortcutSwitchChange: (switchName) => ({type: homeReducers.SHORTCUT_SWITCH_POSITION, switchName: switchName}),
  onFeatureSelected: (featureSelected) => ({type: spotReducers.FEATURE_SELECTED, feature: featureSelected}),
  setUserData: (userData) => ({type: USER_DATA, userData: userData}),
  clearUserData: () => ({type: USER_DATA_CLEARED})
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPanel);
