import React, {useState} from 'react';
import {Animated, View} from 'react-native';

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Button, Header, Icon} from 'react-native-elements';
import {useSelector} from 'react-redux';

import ActionButtonsSmallScreen from './ActionButtonsSmallScreen';
import homeStyles from './home.style';
import ShortcutButtons from './ShortcutButtons';
import * as themes from '../../shared/styles.constants';
import Map from '../maps/Map';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import SpotNavigator from '../spots/SpotNavigator';

const HomeViewSmallScreen = ({
                               animateLeftSide,
                               clickHandler,
                               closeNotebookPanel,
                               dialogClickHandler,
                               dialogs,
                               distance,
                               drawButtonsVisible,
                               endDraw,
                               endMeasurement,
                               isSelectingForStereonet,
                               isSelectingForTagging,
                               mapComponentRef,
                               mapMode,
                               openNotebookPanel,
                               openSpotInNotebook,
                               setDistance,
                               startEdit,
                               toggleDialog,
                               toggleHomeDrawer,
                             }) => {
  console.log('Rendering HomeViewSmallScreen...');

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const stratSection = useSelector(state => state.map.stratSection);

  const [isShowingSpotNavigator, setIsShowingSpotNavigator] = useState(false);

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
        leftComponent={isShowingSpotNavigator && !isNotebookPanelVisible ? (
          <Icon
            color={themes.PRIMARY_TEXT_COLOR}
            name={'chevron-back'}
            onPress={toggleSpotNavigator}
            type={'ionicon'}
          />
        ) : (
          <Icon
            color={themes.PRIMARY_TEXT_COLOR}
            name={'menu'}
            onPress={toggleHomeDrawer}
          />
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
            options={navigationOptions}>
            {() =>
              <>
                <Map
                  endDraw={endDraw}
                  isSelectingForStereonet={isSelectingForStereonet}
                  isSelectingForTagging={isSelectingForTagging}
                  mapComponentRef={mapComponentRef}
                  mapMode={mapMode}
                  setDistance={setDistance}
                  startEdit={startEdit}
                />

                {!currentImageBasemap && !stratSection && (
                  <ShortcutButtons openNotebookPanel={openNotebookPanel}/>
                )}

                {drawButtonsVisible && (
                  <View style={homeStyles.actionButtonsSmallScreenContainer}>
                    <ActionButtonsSmallScreen
                      clickHandler={clickHandler}
                      dialogClickHandler={dialogClickHandler}
                      dialogs={dialogs}
                      distance={distance}
                      endDraw={endDraw}
                      endMeasurement={endMeasurement}
                      mapComponentRef={mapComponentRef}
                      mapMode={mapMode}
                      toggleDialog={toggleDialog}
                    />
                  </View>
                )}
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
