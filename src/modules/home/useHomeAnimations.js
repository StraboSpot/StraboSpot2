import {useEffect, useRef} from 'react';
import {Animated, Dimensions, Easing, findNodeHandle, Keyboard, Platform, TextInput, UIManager} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {setIsMainMenuPanelVisible} from './home.slice';
import {MAIN_MENU_DRAWER_WIDTH, NOTEBOOK_DRAWER_WIDTH, SMALL_SCREEN} from '../../shared/styles.constants';
import {setMenuSelectionPage, setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {setIsNotebookPanelVisible, setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {PAGE_KEYS} from '../page/page.constants';

const {State: TextInputState} = TextInput;

const platform = Platform.OS === 'ios' ? 'window' : 'screen';
const {height: windowHeight} = Dimensions.get(platform);

// Animations for Drawers & Keyboard
const useHomeAnimations = ({navigation}) => {

  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);

  const animatedValueLeftSide = useRef(new Animated.Value(0)).current;
  const animatedValueMainMenuDrawer = useRef(new Animated.Value(-MAIN_MENU_DRAWER_WIDTH)).current;
  const animatedValueNotebookDrawer = useRef(new Animated.Value(NOTEBOOK_DRAWER_WIDTH)).current;
  const animatedValueRightSide = useRef(new Animated.Value(0)).current;
  const animatedValueTextInputs = useRef(new Animated.Value(0)).current;

  const animateLeftSide = {transform: [{translateX: animatedValueLeftSide}]};
  const animateMainMenuDrawer = {transform: [{translateX: animatedValueMainMenuDrawer}]};
  const animateNotebookDrawer = {transform: [{translateX: animatedValueNotebookDrawer}]};
  const animateRightSide = {transform: [{translateX: animatedValueRightSide}]};
  const animateTextInputs = {transform: [{translateY: animatedValueTextInputs}]};

  useEffect(() => {
    // console.log('UE Home [modalVisible]', modalVisible);
    if (Platform.OS === 'ios') {
      Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
      // console.log('Keyboard listeners added to HOME');
      return function cleanup() {
        Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow).remove();
        Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide).remove();
        // console.log('Home Keyboard Listeners Removed');
      };
    }
  }, [modalVisible]);

  // Used to animate open and close of Settings Panel and Notebook Panel
  const animateDrawer = (animatedState, toValue) => {
    Animated.timing(animatedState, {
      toValue: toValue,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const closeMainMenuPanel = () => {
    console.log('Closing Main Menu Panel...');
    dispatch(setIsMainMenuPanelVisible(false));
    dispatch(setMenuSelectionPage({name: null}));
    SMALL_SCREEN && dispatch(setSidePanelVisible(false));
    animateDrawer(animatedValueMainMenuDrawer, -MAIN_MENU_DRAWER_WIDTH);
    animateDrawer(animatedValueLeftSide, 0);
  };

  const closeNotebookPanel = () => {
    console.log('Closing Notebook Panel...');
    animateDrawer(animatedValueNotebookDrawer, NOTEBOOK_DRAWER_WIDTH);
    animateDrawer(animatedValueRightSide, 0);
    setTimeout(() => dispatch(setIsNotebookPanelVisible(false)), 1000);
  };

  const handleKeyboardDidHide = () => Animated.timing(animatedValueTextInputs,
    {toValue: 0, duration: 100, useNativeDriver: Platform.OS !== 'web'}).start();

  const handleKeyboardDidShow = (event) => {
    const keyboardHeight = event.endCoordinates.height;
    const currentlyFocusedField = TextInputState.currentlyFocusedInput
      ? findNodeHandle(TextInputState.currentlyFocusedInput()) : TextInputState.currentlyFocusedField();
    if (currentlyFocusedField === null) return null;
    else {
      UIManager.measure(currentlyFocusedField, (originX, originY, width, height, pageX, pageY) => {
        const fieldHeight = height + 30;
        const fieldTop = pageY;
        const gap = (windowHeight - keyboardHeight) - (fieldTop + fieldHeight);
        if (gap >= 0) return;
        Animated.timing(animatedValueTextInputs,
          {toValue: gap, duration: 100, useNativeDriver: Platform.OS !== 'web'}).start();
      });
    }
  };

  const openMainMenuPanel = () => {
    console.log('Opening Main Menu Panel...');
    dispatch(setIsMainMenuPanelVisible(true));
    animateDrawer(animatedValueMainMenuDrawer, 0);
    animateDrawer(animatedValueLeftSide, MAIN_MENU_DRAWER_WIDTH);
  };

  const openNotebookPanel = (pageView) => {
    console.log('Opening Notebook Panel...');
    dispatch(setNotebookPageVisible(pageView || PAGE_KEYS.OVERVIEW));
    dispatch(setIsNotebookPanelVisible(true));
    animateDrawer(animatedValueNotebookDrawer, 0);
    animateDrawer(animatedValueRightSide, -NOTEBOOK_DRAWER_WIDTH);
    if (SMALL_SCREEN) {
      navigation.navigate('HomeScreen', {screen: 'Notebook'});
      closeMainMenuPanel();
    }
  };

  return {
    animateLeftSide: animateLeftSide,
    animateMainMenuDrawer: animateMainMenuDrawer,
    animateNotebookDrawer: animateNotebookDrawer,
    animateRightSide: animateRightSide,
    animateTextInputs: animateTextInputs,
    closeMainMenuPanel: closeMainMenuPanel,
    closeNotebookPanel: closeNotebookPanel,
    openMainMenuPanel: openMainMenuPanel,
    openNotebookPanel: openNotebookPanel,
  };
};

export default useHomeAnimations;
