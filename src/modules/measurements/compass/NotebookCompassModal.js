import React from 'react';
import {Platform} from 'react-native';

import DragAnimation from '../../../shared/ui/DragAmination';
import Modal from '../../../shared/ui/modal/Modal';
import uiStyles from '../../../shared/ui/ui.styles';
import Compass from './Compass';

const NotebookCompassModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <Modal
        close={props.close}
        buttonTitleLeft={'Undo'}
        textStyle={{fontWeight: 'bold'}}
        onPress={props.onPress}
        style={uiStyles.modalPosition}
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
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
          onPress={props.onPress}
          style={uiStyles.modalPosition}
        >
          <Compass/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default NotebookCompassModal;
