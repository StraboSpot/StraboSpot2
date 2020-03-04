import React from 'react';
import {Platform, View} from 'react-native';
import Modal from '../../shared/ui/modal/Modal';
import styles from './samples.style';
import Samples from './Samples';
import DragAnimation from '../../shared/ui/DragAmination';
// import Orientation from "react-native-orientation-locker";

const notebookSamplesModal = (props) => {
  if (Platform.OS === 'android') {
    // Orientation.lockToPortrait();
    return (
      <View style={styles.modalPosition}>
        <Modal
          component={<Samples onPress={props.onPress}/>}
          close={props.close}
          buttonTitleRight={'Cancel'}
          onPress={props.cancel}
          style={styles.samplesContainer}
        />
      </View>
    );
  }
  else {
    return (
      <DragAnimation style={styles.modalPosition}>
        <Modal
          component={<Samples onPress={props.onPress}/>}
          close={props.close}
          // buttonTitleRight={'Go Back'}
          onPress={props.cancel}
          style={styles.samplesContainer}
        />
      </DragAnimation>
    );
  }
};

export default notebookSamplesModal;
