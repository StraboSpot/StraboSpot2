import React, {useEffect, useState} from 'react';
import {Animated, Keyboard, TextInput} from 'react-native';

import {Avatar, Button, ListItem, Overlay} from 'react-native-elements';
import {useSelector} from 'react-redux';

import compassStyles from '../../../modules/compass/compass.styles';
import {MODAL_KEYS, NOTEBOOK_MODELS, SHORTCUT_MODALS} from '../../../modules/home/home.constants';
import commonStyles from '../../common.styles';
import * as Helpers from '../../Helpers';
import {isEmpty} from '../../Helpers';
import modalStyle from './modal.style';
import ModalHeader from './ModalHeader';

const {State: TextInputState} = TextInput;

const Modal = (props) => {
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const [textInputAnimate] = useState(new Animated.Value(0));

  useEffect(() => {
    console.log('UE Modal []');
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return function cleanup() {
      Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow).remove();
      Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide).remove();
    };
  }, []);

  const handleKeyboardDidShow = (event) => Helpers.handleKeyboardDidShow(event, TextInputState, textInputAnimate);

  const handleKeyboardDidHide = () => Helpers.handleKeyboardDidHide(textInputAnimate);

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
      <Overlay overlayStyle={[modalStyle.modalContainer, modalStyle.modalPosition, props.style]}>
        <ModalHeader {...props}/>
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
      <ModalHeader {...props}/>
      {props.children}
      {!isEmpty(selectedSpot) && renderModalBottom()}
    </Animated.View>
  );
};

export default Modal;
