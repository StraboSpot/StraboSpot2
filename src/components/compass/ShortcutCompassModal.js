import React from 'react';
import {View} from "react-native";
import Modal from '../../shared/ui/modal/Modal.view';
import styles from './CompassStyles';
import Compass from './Compass';
import DragAnimation from '../../shared/ui/DragAmination';

const ShortcutCompassModal = (props) => {
  return (
    <DragAnimation style={styles.modalPositionShortcutView}>
      <Modal
        component={<Compass/>}
        style={styles.compassContainer}
        close={props.close}
        buttonTitleRight={'Undo last'}
        textStyle={{fontWeight: 'bold'}}
      />
    </DragAnimation>
  )
};

export default ShortcutCompassModal;
