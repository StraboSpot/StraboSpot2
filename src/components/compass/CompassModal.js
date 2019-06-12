import React from 'react';
import Modal from '../../shared/ui/modal/Modal.view';
import styles from './CompassStyles';
import Compass from './Compass';


const CompassModal = (props) => {
  return (
    <Modal
      component={<Compass/>}
      style={styles.compassContainer}
      close={() => props.close('isCompassModalVisible')}
      textStyle={{fontWeight: 'bold' }}
    >Tap Compass to record a measurement</Modal>
  )
};

export default CompassModal;
