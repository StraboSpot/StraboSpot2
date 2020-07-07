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
