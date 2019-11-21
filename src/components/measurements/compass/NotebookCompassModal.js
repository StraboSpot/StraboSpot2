import React from 'react';
import {Platform, View} from 'react-native';
import Modal from '../../../shared/ui/modal/Modal.view';
import styles from './CompassStyles';
import Compass from './Compass';
import RMCompass from './RMCompass';
import DragAnimation from '../../../shared/ui/DragAmination';

const NotebookCompassModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={styles.modalPosition}>
        <Modal
          component={<Compass onPress={props.onPress}/>}
          style={styles.compassContainer}
          close={props.close}
          buttonTitleRight={'Undo last'}
          textStyle={{fontWeight: 'bold'}}
        />
      </View>
    );
  }
  else {
    return (
      <DragAnimation style={styles.modalPosition}>
        <Modal
          component={<RMCompass onPress={props.onPress}/>}
          style={styles.compassContainer}
          close={props.close}
          buttonTitleRight={'Undo last'}
          textStyle={{fontWeight: 'bold'}}
        />
      </DragAnimation>
    );
  }
};

export default NotebookCompassModal;
