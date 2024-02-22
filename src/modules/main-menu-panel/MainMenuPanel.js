import React from 'react';
import {SafeAreaView} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import About from './About';
import Documentation from './Documentation';
import {MAIN_MENU_ITEMS} from './mainMenu.constants';
import {setMenuSelectionPage} from './mainMenuPanel.slice';
import mainMenuPanelStyles from './mainMenuPanel.styles';
import MainMenuPanelHeader from './MainMenuPanelHeader';
import MainMenuPanelList from './MainMenuPanelList';
import {isEmpty} from '../../shared/Helpers';
import {ImageGallery} from '../images';
import CustomMapsMenu from '../maps/custom-maps/ManageCustomMaps';
import ImageBasemapsList from '../maps/ImageBasemapsList';
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
import {Tags} from '../tags';

const MainMenuPanel = ({
                         closeMainMenuPanel,
                         logout,
                         openSpotInNotebook,
                         updateSpotsInMapExtent,
                         zoomToCenterOfflineTile,
                         zoomToCustomMap,
                       }) => {
  console.log('Rendering MainMenuPanel...');

  const dispatch = useDispatch();
  const project = useSelector(state => state.project.project);
  const settingsPageVisible = useSelector(state => state.mainMenu.mainMenuPageVisible);

  const getMainMenuContent = () => {
    switch (settingsPageVisible) {
      case MAIN_MENU_ITEMS.MANAGE.MY_STRABOSPOT:
        return <MyStraboSpot logout={logout}/>;
      case MAIN_MENU_ITEMS.MANAGE.ACTIVE_PROJECTS:
        return (
          <ActiveProject
            title={!isEmpty(project) && project.description ? project.description.project_name : 'Un-named'}
          />
        );
      case MAIN_MENU_ITEMS.MANAGE.UPLOAD_BACKUP_EXPORT:
        return <UploadBackupAndExport closeMainMenuPanel={closeMainMenuPanel}/>;
      case MAIN_MENU_ITEMS.ATTRIBUTES.SPOTS_LIST:
        return <SpotsList onPress={openSpotInNotebook} updateSpotsInMapExtent={updateSpotsInMapExtent}/>;
      case MAIN_MENU_ITEMS.ATTRIBUTES.IMAGE_GALLERY:
        return <ImageGallery openSpotInNotebook={openSpotInNotebook} updateSpotsInMapExtent={updateSpotsInMapExtent}/>;
      case MAIN_MENU_ITEMS.ATTRIBUTES.SAMPLES:
        return (
          <SamplesMenuItem
            openSpotInNotebook={openSpotInNotebook}
            updateSpotsInMapExtent={updateSpotsInMapExtent}
          />
        );
      case MAIN_MENU_ITEMS.ATTRIBUTES.GEOLOGIC_UNITS:
        return <Tags type={'geologic_unit'}/>;
      case MAIN_MENU_ITEMS.ATTRIBUTES.TAGS:
        return <Tags/>;
      case MAIN_MENU_ITEMS.MAPS.CUSTOM:
        return <CustomMapsMenu zoomToCustomMap={zoomToCustomMap}/>;
      case MAIN_MENU_ITEMS.MAPS.IMAGE_BASEMAPS :
        return <ImageBasemapsList closeManMenuPanel={closeMainMenuPanel}/>;
      case MAIN_MENU_ITEMS.MAPS.STRAT_SECTIONS :
        return <StratSectionsList closeManMenuPanel={closeMainMenuPanel}/>;
      case MAIN_MENU_ITEMS.MAPS.MANAGE_OFFLINE_MAPS:
        return (
          <ManageOfflineMapsMenu
            closeMainMenuPanel={closeMainMenuPanel}
            zoomToCenterOfflineTile={zoomToCenterOfflineTile}
          />
        );
      case MAIN_MENU_ITEMS.PREFERENCES.SHORTCUTS:
        return <ShortcutMenu/>;
      case MAIN_MENU_ITEMS.PREFERENCES.NAMING_CONVENTIONS:
        return <NamingConventions/>;
      case MAIN_MENU_ITEMS.PREFERENCES.MISCELLANEOUS:
        return <Miscellaneous/>;
      case MAIN_MENU_ITEMS.HELP.ABOUT:
        return <About/>;
      case MAIN_MENU_ITEMS.HELP.DOCUMENTATION:
        return <Documentation/>;
      default:
        return (
          <MainMenuPanelList
            onPress={setVisibleMenu}
            activeProject={!isEmpty(project) && project.description ? project.description.project_name
              : 'No Active Project'}
          />
        );
    }
  };

  const setVisibleMenu = (name) => {
    dispatch(setMenuSelectionPage({name: name}));
  };

  return (
    <SafeAreaView style={mainMenuPanelStyles.container}>
      <MainMenuPanelHeader onPress={() => dispatch(setMenuSelectionPage({name: null}))}/>
      {getMainMenuContent()}
    </SafeAreaView>
  );
};

export default MainMenuPanel;
