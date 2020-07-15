import React from 'react';
import {View, Platform} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import styles from '../measurements/compass/compass.styles';
import Notes from './Notes';

const ShortcutNotesModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={styles.modalPositionShortcutView}>
        <Modal
          component={<Notes onPress={props.onPress}/>}
          // style={home.compassContainer}
          close={props.close}
          buttonTitleLeft={'Undo last'}
          textStyle={{fontWeight: 'bold'}}
        />
      </View>
    );
  }
  else {
    return (
      <DragAnimation style={styles.modalPositionShortcutView}>
        <Modal
          component={<Notes />}
          style={styles.compassContainer}
          close={props.close}
          onPress={props.onPress}
          // spotName={props.spotName}
          buttonTitleLeft={'Undo last'}
          textStyle={{fontWeight: 'bold'}}
          // bottom={props.bottom}
        >{props.children}</Modal>
      </DragAnimation>
    );
  }
};

export default ShortcutNotesModal;
