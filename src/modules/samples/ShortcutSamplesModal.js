import React from 'react';
import {Platform, View} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import AddSample from './AddSample';
import styles from './samples.style';

const shortcutSamplesModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={styles.modalPositionShortcutView}>
        <Modal
          close={props.close}
          onPress={props.onPress}
        >
          <AddSample/>
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
        >
          <AddSample/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default shortcutSamplesModal;
