import React from 'react';
import {Platform} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {MODALS} from '../home/home.constants';
import Compass from './Compass';

const CompassModal = (props) => {

  const renderCompassModalContent = () => {
    return (
      <Modal
        close={props.close}
        textStyle={{fontWeight: 'bold'}}
        onPress={props.onPress}
        style={props.type === MODALS.NOTEBOOK_MODALS.COMPASS ? uiStyles.modalPosition : uiStyles.modalPositionShortcutView}
      >
        <Compass/>
      </Modal>
    );
  };

  if (Platform.OS === 'android') return renderCompassModalContent();
  else return <DragAnimation>{renderCompassModalContent()}</DragAnimation>;
};

export default CompassModal;
