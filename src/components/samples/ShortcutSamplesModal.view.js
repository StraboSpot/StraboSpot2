import React from 'react';
import Modal from '../../shared/ui/modal/Modal.view';
import styles from './samples.style';
import Samples from './Samples.view';
import DragAnimation from '../../shared/ui/DragAmination';

const shortcutSamplesModalView = (props) => {
  return (
    <DragAnimation style={styles.modalPositionShortcutView}>
      <Modal
        component={<Samples onPress={props.onPress}/>}
        close={props.close}
        // buttonTitleRight={'Cancel'}
        onPress={props.cancel}
        style={styles.samplesContainer}
      />
    </DragAnimation>
  );
};

export default shortcutSamplesModalView;
