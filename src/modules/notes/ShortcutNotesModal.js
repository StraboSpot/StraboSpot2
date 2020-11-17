import React from 'react';
import {Platform} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import Notes from './Notes';

const ShortcutNotesModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <Modal
        close={props.close}
        onPress={props.onPress}
        textStyle={{fontWeight: 'bold'}}
        style={uiStyles.modalPositionShortcutView}
      >
        <Notes/>
      </Modal>
    );
  }
  else {
    return (
      <DragAnimation>
        <Modal
          close={props.close}
          onPress={props.onPress}
          textStyle={{fontWeight: 'bold'}}
          style={uiStyles.modalPositionShortcutView}
        >
          <Notes/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default ShortcutNotesModal;
