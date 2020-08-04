import React from 'react';
import {Platform, View} from 'react-native';

import DragAnimation from '../../../shared/ui/DragAmination';
import Modal from '../../../shared/ui/modal/Modal';
import Compass from './Compass';
import styles from './compass.styles';
import RMCompass from './RMCompass';

const NotebookCompassModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={styles.modalPosition}>
        <Modal
          style={styles.compassContainer}
          close={props.close}
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
        >
          <Compass onPress={props.onPress}/>
        </Modal>
      </View>
    );
  }
  else {
    return (
      <DragAnimation style={styles.modalPosition}>
        <Modal
          style={styles.compassContainer}
          close={props.close}
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
        >
          <RMCompass onPress={props.onPress}/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default NotebookCompassModal;
