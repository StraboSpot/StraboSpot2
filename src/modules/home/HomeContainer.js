import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, Platform} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import Home from './Home';
import {setIsMainMenuPanelVisible, setIsProjectLoadComplete, setLoadingStatus} from './home.slice';
import homeStyles from './home.style';
import OverlaysContainer from './OverlaysContainer';
import useDevice from '../../services/useDevice';
import {animateDrawer, isEqual} from '../../shared/Helpers';
import {MAIN_MENU_DRAWER_WIDTH, NOTEBOOK_DRAWER_WIDTH, SMALL_SCREEN} from '../../shared/styles.constants';
import MainMenuPanel from '../main-menu-panel/MainMenuPanel';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import settingPanelStyles from '../main-menu-panel/mainMenuPanel.styles';
import {setIsNotebookPanelVisible, setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {PAGE_KEYS} from '../page/page.constants';
import {useSpots} from '../spots';
import {setSelectedAttributes} from '../spots/spots.slice';

const HomeContainer = ({navigation, route}) => {
  // console.log('Rendering HomeContainer...');

  const toast = useToast();
  const {createProjectDirectories} = useDevice();
  const {handleSpotSelected} = useSpots();

  const dispatch = useDispatch();

  const projectLoadComplete = useSelector(state => state.home.isProjectLoadComplete);
  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const userEmail = useSelector(state => state.user.email);
  const userName = useSelector(state => state.user.name);

  const animatedValueLeftSide = useRef(new Animated.Value(0)).current;
  const animatedValueMainMenuDrawer = useRef(new Animated.Value(-MAIN_MENU_DRAWER_WIDTH)).current;
  const animatedValueNotebookDrawer = useRef(new Animated.Value(NOTEBOOK_DRAWER_WIDTH)).current;
  const animatedValueRightSide = useRef(new Animated.Value(0)).current;
  const animatedValueTextInputs = useRef(new Animated.Value(0)).current;
  const mapComponentRef = useRef(null);

  const animateMainMenuDrawer = {transform: [{translateX: animatedValueMainMenuDrawer}]};
  const animateTextInputs = {transform: [{translateY: animatedValueTextInputs}]};

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

  const closeMainMenuPanel = useCallback(() => {
    console.log('Closing Main Menu Panel...');
    dispatch(setIsMainMenuPanelVisible(false));
    dispatch(setMenuSelectionPage({name: null}));
    SMALL_SCREEN && dispatch(setSidePanelVisible(false));
    animateDrawer(animatedValueMainMenuDrawer, -MAIN_MENU_DRAWER_WIDTH);
    animateDrawer(animatedValueLeftSide, 0);
  }, [animatedValueLeftSide, animatedValueMainMenuDrawer, dispatch]);

  const closeNotebookPanel = useCallback(() => {
    console.log('Closing Notebook Panel...');
    animateDrawer(animatedValueNotebookDrawer, NOTEBOOK_DRAWER_WIDTH);
    animateDrawer(animatedValueRightSide, 0);
    setTimeout(() => dispatch(setIsNotebookPanelVisible(false)), 1000);
  }, [animatedValueNotebookDrawer, animatedValueRightSide, dispatch]);

  const openMainMenuPanel = useCallback(() => {
    console.log('Opening Main Menu Panel...');
    dispatch(setIsMainMenuPanelVisible(true));
    animateDrawer(animatedValueMainMenuDrawer, 0);
    animateDrawer(animatedValueLeftSide, MAIN_MENU_DRAWER_WIDTH);
  }, [animatedValueLeftSide, animatedValueMainMenuDrawer, dispatch]);

  const openNotebookPanel = useCallback((pageView) => {
    console.log('Opening Notebook Panel...');
    dispatch(setNotebookPageVisible(pageView || PAGE_KEYS.OVERVIEW));
    dispatch(setIsNotebookPanelVisible(true));
    animateDrawer(animatedValueNotebookDrawer, 0);
    animateDrawer(animatedValueRightSide, -NOTEBOOK_DRAWER_WIDTH);
    if (SMALL_SCREEN) {
      navigation.navigate('HomeScreen', {screen: 'Notebook'});
      closeMainMenuPanel();
    }
  }, [animatedValueNotebookDrawer, animatedValueRightSide, closeMainMenuPanel, dispatch, navigation]);

  const openSpotInNotebook = (spot, notebookPage, attributes) => {
    handleSpotSelected(spot);
    if (!isEqual(attributes, selectedAttributes)) dispatch(setSelectedAttributes(attributes));
    if (notebookPage) openNotebookPanel(notebookPage);
    else openNotebookPanel(PAGE_KEYS.OVERVIEW);
  };

  const zoomToCurrentLocation = useCallback(async () => {
    dispatch(setLoadingStatus({view: 'home', bool: true}));
    try {
      await mapComponentRef.current?.zoomToCurrentLocation();
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
    catch (err) {
      // console.error('Geolocation Error:', err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toast.show(`${err.toString()}`);
    }
  }, [dispatch, toast]);

  return (
    <Animated.View style={[homeStyles.container, animateTextInputs]}>
      <Home
        animatedValueLeftSide={animatedValueLeftSide}
        animatedValueNotebookDrawer={animatedValueNotebookDrawer}
        animatedValueRightSide={animatedValueRightSide}
        closeMainMenuPanel={closeMainMenuPanel}
        closeNotebookPanel={closeNotebookPanel}
        openMainMenuPanel={openMainMenuPanel}
        openNotebookPanel={openNotebookPanel}
        openSpotInNotebook={openSpotInNotebook}
        ref={mapComponentRef}
        zoomToCurrentLocation={zoomToCurrentLocation}
      />
      <OverlaysContainer
        animatedValueTextInputs={animatedValueTextInputs}
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
