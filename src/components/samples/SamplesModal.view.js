import React from 'react';
import {Text, View} from 'react-native';
import Modal from '../../shared/ui/modal/Modal.view';
import styles from './samples.styles';

const samplesModalView = (props) => {
  console.log('SampleModal props', props)
  return (
    <Modal
      close={() => props.close('isSamplesModalVisible')}
      textStyle={{fontWeight: 'bold' }}
      style={styles.samplesContainer}
    >
      Samples Modal Content
    </Modal>
  );
};

export default samplesModalView;
