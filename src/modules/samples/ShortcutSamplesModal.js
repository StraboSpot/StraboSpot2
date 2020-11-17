import React from 'react';
import {Platform} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import AddSample from './AddSample';

const shortcutSamplesModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <Modal
        close={props.close}
        onPress={props.onPress}
        style={uiStyles.modalPositionShortcutView}
      >
        <AddSample/>
      </Modal>
    );
  }
  else {
    return (
      <DragAnimation>
        <Modal
          close={props.close}
          onPress={props.onPress}
          style={uiStyles.modalPositionShortcutView}
        >
          <AddSample/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default shortcutSamplesModal;
