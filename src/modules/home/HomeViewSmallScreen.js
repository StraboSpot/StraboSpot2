import React, {useState} from 'react';
import {View} from 'react-native';

import {Button, Header, Icon, Tab, TabView} from 'react-native-elements';
import {useSelector} from 'react-redux';

import * as themes from '../../shared/styles.constants';
import Map from '../maps/Map';
import NotebookPanel from '../notebook-panel/NotebookPanel';
import SpotNavigator from '../spots/SpotNavigator';
import ActionButtonsSmallScreen from './ActionButtonsSmallScreen';
import homeStyle from './home.style';

const HomeViewSmallScreen = ({
                               closeNotebookPanel,
                               clickHandler,
                               endDraw,
                               isSelectingForStereonet,
                               isSelectingForTagging,
                               mapComponentRef,
                               mapMode,
                               openNotebookPanel,
                               setDistance,
                               startEdit,
                               toggleHomeDrawer,
                             }) => {
  console.log('Rendering HomeViewSmallScreen...');

  const [isShowingSpotNavigator, setIsShowingSpotNavigator] = useState(false);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const toggleSpotNavigator = () => {
    closeNotebookPanel();
    setIsShowingSpotNavigator(s => !s);
  };

  return (
    <>
      <Header
        backgroundColor={themes.PRIMARY_BACKGROUND_COLOR}
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
        <View style={{height: '100%', width: '100%'}}>
          <SpotNavigator
            closeSpotsNavigator={toggleSpotNavigator}
            openNotebookPanel={openNotebookPanel}
          />
        </View>
      ) : (
        <>
          <Tab
            indicatorStyle={{borderBottomColor: themes.BLACK, borderBottomWidth: 3}}
            onChange={i => i === 0 ? closeNotebookPanel() : openNotebookPanel()}
            value={isNotebookPanelVisible ? 1 : 0}
          >
            <Tab.Item
              buttonStyle={{padding: 0, backgroundColor: themes.PRIMARY_BACKGROUND_COLOR}}
              title={'MAP'}
              titleStyle={{color: themes.PRIMARY_TEXT_COLOR, fontSize: themes.PRIMARY_HEADER_TEXT_SIZE}}
            />
            <Tab.Item
              buttonStyle={{padding: 0, backgroundColor: themes.PRIMARY_BACKGROUND_COLOR}}
              title={'NOTEBOOK'}
              titleStyle={{color: themes.PRIMARY_TEXT_COLOR, fontSize: themes.PRIMARY_HEADER_TEXT_SIZE}}
            />
          </Tab>

          <TabView value={isNotebookPanelVisible ? 1 : 0}>
            <TabView.Item style={{width: '100%'}}>
              <View style={{flex: 1}}>
                <Map
                  endDraw={endDraw}
                  isSelectingForStereonet={isSelectingForStereonet}
                  isSelectingForTagging={isSelectingForTagging}
                  mapComponentRef={mapComponentRef}
                  mapMode={mapMode}
                  setDistance={setDistance}
                  startEdit={startEdit}
                />
                <View style={homeStyle.actionButtonsSmallScreenContainer}>
                  <ActionButtonsSmallScreen
                    clickHandler={clickHandler}
                  />
                </View>
              </View>

            </TabView.Item>
            <TabView.Item style={{width: '100%'}}>
              <NotebookPanel
                closeNotebookPanel={closeNotebookPanel}
                createDefaultGeom={() => mapComponentRef.current?.createDefaultGeom()}
                openMainMenu={toggleHomeDrawer}
                zoomToSpot={() => mapComponentRef.current?.zoomToSpot()}
              />
            </TabView.Item>
          </TabView>
        </>
      )}
    </>
  );
};

export default HomeViewSmallScreen;
