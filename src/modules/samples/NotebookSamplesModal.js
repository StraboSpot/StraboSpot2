import React from 'react';
import {Platform, View} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import AddSample from './AddSample';
import styles from './samples.style';

const NotebookSamplesModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={styles.modalPosition}>
        <Modal
          close={props.close}
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
          onPress={props.onPress}
        >
          <AddSample/>
        </Modal>
      </View>
    );
  }
  else {
    return (
      <DragAnimation style={styles.modalPosition}>
        <Modal
          close={props.close}
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
          onPress={props.onPress}
        >
          <AddSample/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default NotebookSamplesModal;
