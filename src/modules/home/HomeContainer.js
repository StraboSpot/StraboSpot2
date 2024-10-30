import React, {useEffect, useRef} from 'react';
import {Animated, Platform} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {useDispatch, useSelector} from 'react-redux';

import Home from './Home';
import {setIsProjectLoadComplete} from './home.slice';
import homeStyles from './home.style';
import OverlaysContainer from './OverlaysContainer';
import useHomeAnimations from './useHomeAnimations';
import useHomeContainer from './useHomeContainer';
import useDevice from '../../services/useDevice';
import MainMenuPanel from '../main-menu-panel/MainMenuPanel';
import settingPanelStyles from '../main-menu-panel/mainMenuPanel.styles';

const HomeContainer = ({navigation, route}) => {
  console.log('Rendering HomeContainer...');

  const dispatch = useDispatch();

  const mapComponentRef = useRef(null);

  const projectLoadComplete = useSelector(state => state.home.isProjectLoadComplete);
  const userEmail = useSelector(state => state.user.email);
  const userName = useSelector(state => state.user.name);

  const {createProjectDirectories} = useDevice();
  const {
    animateLeftSide,
    animateMainMenuDrawer,
    animateNotebookDrawer,
    animateRightSide,
    animateTextInputs,
    closeMainMenuPanel,
    closeNotebookPanel,
    openMainMenuPanel,
    openNotebookPanel,
  } = useHomeAnimations({navigation});
  const {openSpotInNotebook, zoomToCurrentLocation} = useHomeContainer({mapComponentRef, openNotebookPanel});

  useEffect(() => {
    Platform.OS !== 'web' && createProjectDirectories().catch(
      err => console.error('Error creating app directories', err));
  }, []);

  useEffect(() => {
    // console.log('UE HomeContainer', '[navigation, route.params]', route.params);
    const unsubscribe = navigation.addListener('focus', () => {
      route?.params?.pageKey === 'overview' && openNotebookPanel(route.params.pageKey);
    });
    return () => {
      // console.log('Navigation Unsubscribed');
      return unsubscribe;
    };
  }, [navigation, route.params]);

  useEffect(() => {
    // console.log('UE HomeContainer [user]', userEmail);
    if (userEmail && userName) {
      Sentry.configureScope((scope) => {
        scope.setUser({'email': userEmail, 'username': userName});
      });
    }
  }, [userEmail, userName]);

  useEffect(() => {
    // console.log('UE HomeContainer [projectLoadComplete]', projectLoadComplete);
    if (projectLoadComplete) {
      mapComponentRef.current?.zoomToSpotsExtent();
      dispatch(setIsProjectLoadComplete(false));
      // toggles off whenever new project is loaded successfully to trigger the same for next project load.
    }
  }, [projectLoadComplete]);

  return (
    <Animated.View style={[homeStyles.container, animateTextInputs]}>
      <Home
        animateLeftSide={animateLeftSide}
        animateNotebookDrawer={animateNotebookDrawer}
        animateRightSide={animateRightSide}
        closeMainMenuPanel={closeMainMenuPanel}
        closeNotebookPanel={closeNotebookPanel}
        openMainMenuPanel={openMainMenuPanel}
        openNotebookPanel={openNotebookPanel}
        openSpotInNotebook={openSpotInNotebook}
        ref={mapComponentRef}
        zoomToCurrentLocation={zoomToCurrentLocation}
      />
      <OverlaysContainer
        closeNotebookPanel={closeNotebookPanel}
        openMainMenuPanel={openMainMenuPanel}
        openNotebookPanel={openNotebookPanel}
        getCurrentZoom={mapComponentRef.current?.getCurrentZoom}
        getExtentString={mapComponentRef.current?.getExtentString}
        getTileCount={mapComponentRef.current?.getTileCount}
        zoomToCurrentLocation={zoomToCurrentLocation}
      />
      <Animated.View style={[settingPanelStyles.settingsDrawer, animateMainMenuDrawer]}>
        <MainMenuPanel
          closeMainMenuPanel={closeMainMenuPanel}
          openMainMenuPanel={openMainMenuPanel}
          openNotebookPanel={openNotebookPanel}
          openSpotInNotebook={openSpotInNotebook}
          updateSpotsInMapExtent={mapComponentRef.current?.updateSpotsInMapExtent}
          zoomToCenterOfflineTile={mapComponentRef.current?.zoomToCenterOfflineTile}
          zoomToCustomMap={mapComponentRef.current?.zoomToCustomMap}
        />
      </Animated.View>
    </Animated.View>
  );
};

export default HomeContainer;
