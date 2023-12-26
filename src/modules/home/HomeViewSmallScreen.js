import React, {useState} from 'react';
import {Animated, useWindowDimensions, View} from 'react-native';

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Button, Header, Icon} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import ActionButtonsSmallScreen from './ActionButtonsSmallScreen';
import EditCancelSaveButtons from './buttons/EditCancelSaveButtons';
import {setModalVisible} from './home.slice';
import homeStyles from './home.style';
import ShortcutButtons from './ShortcutButtons';
import * as themes from '../../shared/styles.constants';
import IconButton from '../../shared/ui/IconButton';
import Map from '../maps/Map';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import {MODAL_KEYS} from '../page/page.constants';
import SpotNavigator from '../spots/SpotNavigator';

const HomeViewSmallScreen = ({
                               animateLeftSide,
                               areEditButtonsVisible,
                               clickHandler,
                               closeNotebookPanel,
                               dialogClickHandler,
                               dialogs,
                               distance,
                               drawButtonsVisible,
                               endMeasurement,
                               isMainMenuPanelVisible,
                               isSelectingForStereonet,
                               isSelectingForTagging,
                               mapComponentRef,
                               mapMode,
                               onEndDrawPressed,
                               openNotebookPanel,
                               openSpotInNotebook,
                               setDistance,
                               startEdit,
                               toggleDialog,
                               toggleHomeDrawer,
                             }) => {
  console.log('Rendering HomeViewSmallScreen...');

  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const stratSection = useSelector(state => state.map.stratSection);

  const [isShowingSpotNavigator, setIsShowingSpotNavigator] = useState(false);

  const {height, width} = useWindowDimensions();

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
    <Animated.View style={[homeStyles.container, animateLeftSide]}>
      <Header
        backgroundColor={themes.SECONDARY_BACKGROUND_COLOR}
        barStyle={'dark-content'}
        leftComponent={isShowingSpotNavigator && !isNotebookPanelVisible ? (
          <Icon
            color={themes.PRIMARY_TEXT_COLOR}
            name={'chevron-back'}
            onPress={toggleSpotNavigator}
            type={'ionicon'}
          />
        ) : (
          isMainMenuPanelVisible ? (
            <IconButton
              source={require('../../assets/icons/Home_pressed.png')}
              onPress={toggleHomeDrawer}
              imageStyle={homeStyles.homeIconSmallScreen}
            />
          ) : (
            <IconButton
              source={require('../../assets/icons/Home.png')}
              onPress={toggleHomeDrawer}
              imageStyle={homeStyles.homeIconSmallScreen}
            />
          )
        )}
        centerComponent={
          <Button
            buttonStyle={{padding: 0}}
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
                <Map
                  isSelectingForStereonet={isSelectingForStereonet}
                  isSelectingForTagging={isSelectingForTagging}
                  mapComponentRef={mapComponentRef}
                  mapMode={mapMode}
                  onEndDrawPressed={onEndDrawPressed}
                  setDistance={setDistance}
                  startEdit={startEdit}
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
                  <ShortcutButtons openNotebookPanel={openNotebookPanel}/>
                )}

                {drawButtonsVisible && (
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
                      toggleDialog={toggleDialog}
                    />
                  </View>
                )}

                <EditCancelSaveButtons
                  areEditButtonsVisible={areEditButtonsVisible}
                  clickHandler={clickHandler}
                />
              </>
            }
          </Tab.Screen>
          <Tab.Screen name={'Notebook'} options={navigationOptions}>
            {() =>
              <NotebookPanel
                closeNotebookPanel={closeNotebookPanel}
                createDefaultGeom={() => mapComponentRef.current?.createDefaultGeom()}
                openMainMenu={toggleHomeDrawer}
                zoomToSpot={() => mapComponentRef.current?.zoomToSpot()}
              />
            }
          </Tab.Screen>
        </Tab.Navigator>
      )}
    </Animated.View>
  );
};

export default HomeViewSmallScreen;
