import React, {useEffect, useState} from 'react';
import {Animated, Keyboard, Text, TextInput, View} from 'react-native';

import {Avatar, Button, ListItem, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import compassStyles from '../../../modules/compass/compass.styles';
import {MODAL_KEYS, MODALS, NOTEBOOK_MODELS, SHORTCUT_MODALS} from '../../../modules/home/home.constants';
import {setModalVisible} from '../../../modules/home/home.slice';
import {NOTEBOOK_PAGES, PAGE_KEYS} from '../../../modules/page/page.constants';
import commonStyles from '../../common.styles';
import * as Helpers from '../../Helpers';
import {isEmpty} from '../../Helpers';
import * as themes from '../../styles.constants';
import modalStyle from './modal.style';

const {State: TextInputState} = TextInput;

const Modal = (props) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const pageVisible = useSelector(state => state.notebook.visibleNotebookPagesStack.slice(-1)[0]);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const [textInputAnimate] = useState(new Animated.Value(0));

  const modalInfo = MODALS.find(p => p.key === modalVisible);

  useEffect(() => {
    console.log('useEffect Form []');
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return function cleanup() {
      Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow).remove();
      Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide).remove();
    };
  }, []);

  const handleKeyboardDidShow = (event) => Helpers.handleKeyboardDidShow(event, TextInputState, textInputAnimate);

  const handleKeyboardDidHide = () => Helpers.handleKeyboardDidHide(textInputAnimate);

  const getTitle = () => {
    if (pageVisible === PAGE_KEYS.GEOLOGIC_UNITS) {
      return NOTEBOOK_PAGES.find(p => p.key === PAGE_KEYS.GEOLOGIC_UNITS).action_label;
    }
    else return modalInfo && (modalInfo.action_label || modalInfo.label);
  };

  const renderModalHeader = () => {
    return (
      <View style={modalStyle.modalTop}>
        <View style={{flex: 1, alignItems: 'flex-start'}}>
          <Button
            titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
            title={props.buttonTitleLeft}
            type={'clear'}
            onPress={props.cancel}
          />
        </View>
        <View>
          <Text style={modalStyle.modalTitle}>{getTitle()}</Text>
        </View>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Button
            titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
            title={props.buttonTitleRight || 'Close'}
            type={'clear'}
            onPress={props.close || (() => dispatch(setModalVisible({modal: null})))}
          />
        </View>
      </View>
    );
  };

  const renderModalBottom = () => {
    const shortcutModal = SHORTCUT_MODALS.find(m => m.key === modalVisible);
    const notebookModal = NOTEBOOK_MODELS.find(m => m.key === modalVisible);

    if (shortcutModal && shortcutModal.notebook_modal_key) {
      return (
        <ListItem
          containerStyle={commonStyles.listItem}
          onPress={() => props.onPress(shortcutModal.notebook_modal_key)}
        >
          <Avatar
            placeholderStyle={{backgroundColor: 'transparent'}}
            size={20}
            source={require('../../../assets/icons/NotebookView_pressed.png')}
          />
          <ListItem.Content>
            <ListItem.Title style={commonStyles.listItemTitle}>Go to Last Spot Created</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron/>
        </ListItem>
      );
    }
    else if (notebookModal) {
      const shortcutModalSwitch = SHORTCUT_MODALS.find(m => m.notebook_modal_key === modalVisible);
      if (shortcutModalSwitch) {
        return (
          <Button
            title={'View In Shortcut Mode'}
            type={'clear'}
            titleStyle={compassStyles.buttonTitleStyle}
            onPress={() => props.onPress(shortcutModalSwitch.key)}
          />
        );
      }
    }
  };

  if (modalVisible === MODAL_KEYS.NOTEBOOK.MEASUREMENTS || modalVisible === MODAL_KEYS.SHORTCUTS.MEASUREMENT) {
    return (
      <Overlay overlayStyle={[modalStyle.modalContainer, modalStyle.modalPosition]}>
        {renderModalHeader()}
        {props.children}
        {!isEmpty(selectedSpot) && renderModalBottom()}
      </Overlay>
    );
  }
  return (
    <Animated.View
      style={[modalStyle.modalContainer, modalStyle.modalPosition, props.style,
        {transform: [{translateY: textInputAnimate}]}]}
    >
      {renderModalHeader()}
      {props.children}
      {!isEmpty(selectedSpot) && renderModalBottom()}
    </Animated.View>
  );
};

export default Modal;
