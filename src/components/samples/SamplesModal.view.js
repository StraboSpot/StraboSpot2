import React from 'react';
import {Text, View} from 'react-native';
import Modal from '../../shared/ui/modal/Modal.view';

const samplesModalView = (props) => {
  console.log('SampleModal props', props)
  return (
    <Modal
      close={() => props.close('isSamplesModalVisible')}
      textStyle={{fontWeight: 'bold' }}
    >
      Samples Modal Content
    </Modal>
  );
};

export default samplesModalView;
