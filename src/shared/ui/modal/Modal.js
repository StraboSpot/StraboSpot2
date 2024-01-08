import React, {useState} from 'react';
import {Animated, View, useWindowDimensions} from 'react-native';

import {Avatar, Button, ListItem, Overlay} from 'react-native-elements';
import {useSelector} from 'react-redux';

import ModalHeader from './ModalHeader';
import compassStyles from '../../../modules/compass/compass.styles';
import overlayStyles from '../../../modules/home/overlays/overlay.styles';
import {MODAL_KEYS, NOTEBOOK_MODELS, SHORTCUT_MODALS} from '../../../modules/page/page.constants';
import commonStyles from '../../common.styles';
import {isEmpty} from '../../Helpers';
import {SMALL_SCREEN} from '../../styles.constants';

const Modal = ({
                 buttonTitleLeft,
                 buttonTitleRight,
                 cancel,
                 children,
                 closeModal,
                 onPress,
                 title,
               }) => {

  const {height} = useWindowDimensions();

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
          onPress={() => onPress(shortcutModal.notebook_modal_key)}
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
            onPress={() => onPress(shortcutModalSwitch.key)}
          />
        );
      }
    }
  };

  if (modalVisible === MODAL_KEYS.NOTEBOOK.MEASUREMENTS || modalVisible === MODAL_KEYS.SHORTCUTS.MEASUREMENT
    || SMALL_SCREEN) {
    return (
      <Overlay
        isVisible={modalVisible === MODAL_KEYS.NOTEBOOK.MEASUREMENTS || modalVisible === MODAL_KEYS.SHORTCUTS.MEASUREMENT || SMALL_SCREEN}
        overlayStyle={SMALL_SCREEN ? overlayStyles.overlayContainerFullScreen : {
          ...overlayStyles.overlayContainer,
          maxHeight: height * 0.80,
        }}
        fullScreen={SMALL_SCREEN}
        animationType={'slide'}
      >
        <ModalHeader
          buttonTitleLeft={buttonTitleLeft}
          buttonTitleRight={buttonTitleRight}
          cancel={cancel}
          closeModal={closeModal}
          title={title}
        />
        {children}
        {!isEmpty(selectedSpot) && isEmpty(selectedAttributes) && renderModalBottom()}
      </Overlay>
    );
  }
  return (
    <View style={{...overlayStyles.overlayContainer, ...overlayStyles.overlayPosition, maxHeight: height * 0.80}}>
      <ModalHeader
        buttonTitleLeft={buttonTitleLeft}
        buttonTitleRight={buttonTitleRight}
        cancel={cancel}
        closeModal={closeModal}
        title={title}
      />
      {children}
      {!isEmpty(selectedSpot) && renderModalBottom()}
    </View>
  );
};

export default Modal;
