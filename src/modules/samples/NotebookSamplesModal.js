import React from 'react';
import {Platform, View} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import modalStyle from '../../shared/ui/modal/modal.style';
import Samples from './Samples';
import styles from './samples.style';

const notebookSamplesModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={styles.modalPosition}>
        <Modal
          style={modalStyle.modalContainer}
          close={props.close}
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
        >
          <Samples onPress={props.onPress}/>
        </Modal>
      </View>
    );
  }
  else {
    return (
      <DragAnimation style={styles.modalPosition}>
        <Modal
          style={modalStyle.modalContainer}
          close={props.close}
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
          onPress={props.onPress}
        >
          <Samples onPress={props.onPress}/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default notebookSamplesModal;
