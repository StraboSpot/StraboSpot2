import React from 'react';
import {View, Platform} from 'react-native';
import Modal from '../../../shared/ui/modal/Modal';
import styles from './compass.styles';
import Compass from './Compass';
import RMCompass from './RMCompass';
import DragAnimation from '../../../shared/ui/DragAmination';

const ShortcutCompassModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={styles.modalPositionShortcutView}>
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
      <DragAnimation style={styles.modalPositionShortcutView}>
        <Modal
          component={<RMCompass />}
          style={styles.compassContainer}
          close={props.close}
          onPress={props.onPress}
          // spotName={props.spotName}
          buttonTitleRight={'Undo last'}
          textStyle={{fontWeight: 'bold'}}
          // bottom={props.bottom}
        >{props.children}</Modal>
      </DragAnimation>
    );
  }
};

export default ShortcutCompassModal;
