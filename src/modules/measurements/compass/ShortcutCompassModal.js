import React from 'react';
import {Platform} from 'react-native';

import DragAnimation from '../../../shared/ui/DragAmination';
import Modal from '../../../shared/ui/modal/Modal';
import uiStyles from '../../../shared/ui/ui.styles';
import Compass from './Compass';

const ShortcutCompassModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <Modal
        close={props.close}
        buttonTitleLeft={'Undo'}
        textStyle={{fontWeight: 'bold'}}
        style={uiStyles.modalPositionShortcutView}
      >
        <Compass/>
      </Modal>
    );
  }
  else {
    return (
      <DragAnimation>
        <Modal
          close={props.close}
          onPress={props.onPress}
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
          style={uiStyles.modalPositionShortcutView}
        >
          <Compass/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default ShortcutCompassModal;
