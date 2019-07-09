import React from 'react';
import { View} from "react-native";
import Modal from '../../shared/ui/modal/Modal.view';
import styles from './samples.style';
import Samples from './Samples.view';

const shortcutSamplesModalView = (props) => {
  return (
      <Modal
        component={<Samples/>}
        close={props.close}
        buttonTitleRight={'Cancel'}
        onPress={props.cancel}
        style={styles.samplesContainer}
      />
  );
};

export default shortcutSamplesModalView;
