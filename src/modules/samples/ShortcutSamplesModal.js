import React from 'react';
import {Platform, View} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import Samples from './Samples';
import styles from './samples.style';

const shortcutSamplesModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={styles.modalPositionShortcutView}>
        <Modal
          close={props.close}
          onPress={props.onPress}
          style={styles.samplesContainer}
        >
          <Samples onPress={props.onPress}/>
        </Modal>
      </View>
    );
  }
  else {
    return (
      <DragAnimation style={styles.modalPositionShortcutView}>
        <Modal
          close={props.close}
          onPress={props.onPress}
          style={styles.samplesContainer}
        >
          <Samples onPress={props.onPress}/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default shortcutSamplesModal;
