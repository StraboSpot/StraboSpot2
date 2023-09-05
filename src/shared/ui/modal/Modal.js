import React, {useState} from 'react';
import {Animated, TextInput, View} from 'react-native';

import {Avatar, Button, ListItem, Overlay} from 'react-native-elements';
import {useSelector} from 'react-redux';

import compassStyles from '../../../modules/compass/compass.styles';
import {MODAL_KEYS, NOTEBOOK_MODELS, SHORTCUT_MODALS} from '../../../modules/page/page.constants';
import commonStyles from '../../common.styles';
import {isEmpty} from '../../Helpers';
import modalStyle from './modal.style';
import ModalHeader from './ModalHeader';

const {State: TextInputState} = TextInput;

const Modal = (props) => {
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedAttributes = useSelector(state => state.spot.selectedAttributes);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const [textInputAnimate] = useState(new Animated.Value(0));

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
      <Overlay
        isVisible={modalVisible === MODAL_KEYS.NOTEBOOK.MEASUREMENTS || modalVisible === MODAL_KEYS.SHORTCUTS.MEASUREMENT}
        overlayStyle={[modalStyle.modalContainer, modalStyle.modalPosition, props.style]}
      >
        <ModalHeader {...props}/>
        {props.children}
        {!isEmpty(selectedSpot) && isEmpty(selectedAttributes) && renderModalBottom()}
      </Overlay>
    );
  }
  return (
    <View style={[modalStyle.modalContainer, modalStyle.modalPosition, props.style]}>
      <ModalHeader {...props}/>
      {props.children}
      {!isEmpty(selectedSpot) && renderModalBottom()}
    </View>
  );
};

export default Modal;
