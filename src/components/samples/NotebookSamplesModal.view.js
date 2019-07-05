import React from 'react';
import {KeyboardAvoidingView, View} from "react-native";
import Modal from '../../shared/ui/modal/Modal.view';
import styles from './samples.style';
import Samples from './Samples.view';

const notebookSamplesModalView = (props) => {
  return (
    <View style={styles.modalPosition}>
      <Modal
        component={<Samples/>}
        close={props.close}
        buttonTitleRight={'Cancel'}
        onPress={props.cancel}
        style={styles.samplesContainer}
      />
    </View>
  );
};

export default notebookSamplesModalView;
