import React from 'react';
import Modal from '../../shared/ui/modal/Modal.view';
import styles from './samples.style';
import Samples from './Samples.view';

const samplesModalView = (props) => {
  console.log('SampleModal props', props)
  return (
    <Modal
      component={<Samples/>}
      close={() => props.close('isSamplesModalVisible')}
      buttonTitleRight={'Cancel'}
      onPress={props.cancel}
      style={styles.samplesContainer}
    >
      New Sample
    </Modal>
  );
};

export default samplesModalView;
