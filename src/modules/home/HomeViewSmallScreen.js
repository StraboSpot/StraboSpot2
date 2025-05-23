import React, {forwardRef, useState} from 'react';
import { View} from 'react-native';

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Button, Header, Icon} from '@rn-vui/base';
import {useDispatch, useSelector} from 'react-redux';

import {ActionButtonsSmallScreen, MainMenuButton, ShortcutButtons} from './buttons';
import {setModalVisible} from './home.slice';
import homeStyles from './home.style';
import * as themes from '../../shared/styles.constants';
import IconButton from '../../shared/ui/IconButton';
import {useWindowSize} from '../../shared/ui/useWindowSize';
import MapContainer from '../maps/MapContainer';
import OfflineMapLabel from '../maps/offline-maps/OfflineMapsLabel';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import {MODAL_KEYS} from '../page/page.constants';
import SpotNavigator from '../spots/SpotNavigator';
import VersionCheckLabel from '../version-check/VersionCheckLabel';

const HomeViewSmallScreen = forwardRef(({
                                          clickHandler,
                                          closeMainMenuPanel,
                                          closeNotebookPanel,
                                          dialogClickHandler,
                                          dialogs,
                                          distance,
                                          endMeasurement,
                                          mapMode,
                                          onEndDrawPressed,
                                          openMainMenuPanel,
                                          openNotebookPanel,
                                          openSpotInNotebook,
                                          selectingMode,
                                          setDistance,
                                          setMapModeToEdit,
                                          toggleDialog,
                                        }, mapComponentRef) => {
  console.log('Rendering HomeViewSmallScreen...');

  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const stratSection = useSelector(state => state.map.stratSection);

  const [isShowingSpotNavigator, setIsShowingSpotNavigator] = useState(false);

  const {height, width} = useWindowSize();

  const navigationOptions = {
    gestureEnabled: false,
    headerShown: false,
    swipeEnabled: false,
  };

  const Tab = createMaterialTopTabNavigator();

  const toggleSpotNavigator = () => {
    closeNotebookPanel();
    setIsShowingSpotNavigator(s => !s);
  };

  return (
    <>
      <Header
        backgroundColor={themes.SECONDARY_BACKGROUND_COLOR}
        barStyle={'dark-content'}
        containerStyle={{marginVertical: -10}}
        centerContainerStyle={{justifyContent: 'center'}}
        leftComponent={isShowingSpotNavigator && !isNotebookPanelVisible ? (
          <Icon
            color={themes.PRIMARY_TEXT_COLOR}
            name={'chevron-back'}
            onPress={toggleSpotNavigator}
            type={'ionicon'}
          />
        ) : <MainMenuButton closeMainMenuPanel={closeMainMenuPanel} openMainMenuPanel={openMainMenuPanel}/>}
        centerComponent={
          <Button
            icon={!isShowingSpotNavigator && (
              <Icon
                color={themes.PRIMARY_TEXT_COLOR}
                name={'chevron-forward'}
                type={'ionicon'}
              />
            )}
            iconRight
            onPress={toggleSpotNavigator}
            size={'sm'}
            title={isShowingSpotNavigator ? 'Spot Navigator' : selectedSpot?.properties?.name || 'Spot Navigator'}
            titleStyle={{color: themes.PRIMARY_TEXT_COLOR, fontSize: themes.PRIMARY_HEADER_TEXT_SIZE}}
            type={'clear'}
          />
        }
      />
      {isShowingSpotNavigator && !isNotebookPanelVisible ? (
        <SpotNavigator
          closeSpotsNavigator={toggleSpotNavigator}
          openNotebookPanel={openNotebookPanel}
          openSpotInNotebook={openSpotInNotebook}
        />
      ) : (
        <Tab.Navigator
          screenOptions={{
            tabBarIndicatorContainerStyle: {backgroundColor: themes.SECONDARY_BACKGROUND_COLOR},
            tabBarIndicatorStyle: {backgroundColor: themes.BLACK, height: 5},
            tabBarItemStyle: {padding: 0},
            tabBarLabelStyle: {fontSize: themes.PRIMARY_HEADER_TEXT_SIZE, color: themes.PRIMARY_TEXT_COLOR},
            tabBarStyle: {backgroundColor: themes.SECONDARY_BACKGROUND_COLOR},
          }}
        >
          <Tab.Screen
            name={'Map'}
            options={{
              ...navigationOptions,
              tabBarLabel: stratSection ? 'Strat Section'
                : currentImageBasemap ? 'Image Basemap'
                  : 'Map',
            }}
          >
            {() =>
              <>
                <MapContainer
                  mapMode={mapMode}
                  onEndDrawPressed={onEndDrawPressed}
                  ref={mapComponentRef}
                  selectingMode={selectingMode}
                  setDistance={setDistance}
                  setMapModeToEdit={setMapModeToEdit}
                />

                {currentImageBasemap && (
                  <IconButton
                    source={require('../../assets/icons/Close.png')}
                    onPress={() => clickHandler('closeImageBasemap')}
                    style={homeStyles.closeButtonSmallScreen}
                  />
                )}
                {stratSection && (
                  <IconButton
                    source={require('../../assets/icons/Close.png')}
                    onPress={() => clickHandler('closeStratSection')}
                    style={homeStyles.closeButtonSmallScreen}
                  />
                )}

                {stratSection && (
                  <IconButton
                    source={require('../../assets/icons/AddIntervalButton.png')}
                    onPress={() => dispatch(setModalVisible({modal: MODAL_KEYS.OTHER.ADD_INTERVAL}))}
                    style={homeStyles.addIntervalButton}
                  />
                )}

                {!currentImageBasemap && !stratSection && (
                  <View style={homeStyles.shortcutButtons}>
                    <ShortcutButtons openNotebookPanel={openNotebookPanel}/>
                  </View>
                )}

                <View
                  style={[homeStyles.actionButtonsSmallScreenContainer,
                    width < height ? homeStyles.actionButtonsSmallScreenContainerPortrait
                      : homeStyles.actionButtonsSmallScreenContainerLandscape]}
                >
                  <ActionButtonsSmallScreen
                    clickHandler={clickHandler}
                    dialogClickHandler={dialogClickHandler}
                    dialogs={dialogs}
                    distance={distance}
                    endMeasurement={endMeasurement}
                    mapComponentRef={mapComponentRef}
                    mapMode={mapMode}
                    onEndDrawPressed={onEndDrawPressed}
                    selectingMode={selectingMode}
                    toggleDialog={toggleDialog}
                  />
                </View>

                <OfflineMapLabel/>
                <VersionCheckLabel/>
              </>
            }
          </Tab.Screen>
          <Tab.Screen name={'Notebook'} options={navigationOptions}>
            {() =>
              <NotebookPanel
                closeNotebookPanel={closeNotebookPanel}
                createDefaultGeom={mapComponentRef.current?.createDefaultGeom}
                openMainMenuPanel={openMainMenuPanel}
                zoomToSpots={mapComponentRef.current?.zoomToSpots}
              />
            }
          </Tab.Screen>
        </Tab.Navigator>
      )}
    </>
  );
});

export default HomeViewSmallScreen;
