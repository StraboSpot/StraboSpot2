import React, {useEffect} from 'react';
import {Keyboard, Platform, TextInput} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {setModalVisible} from './home.slice';
import * as Helpers from '../../shared/Helpers';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import {MODAL_KEYS, MODALS, PAGE_KEYS} from '../page/page.constants';
import {clearedSelectedSpots} from '../spots/spots.slice';

const {State: TextInputState} = TextInput;

const Dialog = ({animatedValueTextInputs, closeNotebookPanel, openNotebookPanel, zoomToCurrentLocation}) => {
  console.log('Rendering Dialog...');

  const dispatch = useDispatch();
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);

  const modal = MODALS.find(m => m.key === modalVisible);

  useEffect(() => {
    // console.log('UE Home [modalVisible]', modalVisible);
    if (Platform.OS === 'ios') {
      Keyboard.addListener('keyboardDidShow', handleKeyboardDidShowHome);
      Keyboard.addListener('keyboardDidHide', handleKeyboardDidHideHome);
      // console.log('Keyboard listeners added to HOME');
      return function cleanup() {
        Keyboard.addListener('keyboardDidShow', handleKeyboardDidShowHome).remove();
        Keyboard.addListener('keyboardDidHide', handleKeyboardDidHideHome).remove();
        // console.log('Home Keyboard Listeners Removed');
      };
    }
  }, [modalVisible]);

  const handleKeyboardDidShowHome = event => Helpers.handleKeyboardDidShow(event, TextInputState,
    animatedValueTextInputs);

  const handleKeyboardDidHideHome = () => Helpers.handleKeyboardDidHide(animatedValueTextInputs);

  const modalHandler = (modalKey) => {
    if (isNotebookPanelVisible || SMALL_SCREEN) {
      if (isNotebookPanelVisible) {
        closeNotebookPanel();
        if (modalVisible && !Object.keys(MODAL_KEYS.SHORTCUTS).find(s => s.key === modalVisible)) {
          dispatch(setModalVisible({modal: null}));
        }
      }
      if (Object.values(MODAL_KEYS.SHORTCUTS).includes(modalKey)) dispatch(clearedSelectedSpots());
      dispatch(setModalVisible({modal: modalKey}));
    }
    else {
      if (modalVisible !== MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS) dispatch(setModalVisible({modal: null}));
      openNotebookPanel(modalKey);
      if (modalKey !== PAGE_KEYS.NOTES) dispatch(setModalVisible({modal: modalKey}));
    }
  };

  if (modal?.modal_component) {
    const ModalDisplayed = modal.modal_component;
    if (modalVisible && !Object.keys(MODAL_KEYS.SHORTCUTS).find(s => s.key === modalVisible)) {
      return (
        <ModalDisplayed
          modalKey={modal.key}
          onPress={modalHandler}
          zoomToCurrentLocation={zoomToCurrentLocation}
        />
      );
    }
    else return <ModalDisplayed modalKey={modal.key} onPress={modalHandler}/>;
  }
};

export default Dialog;
