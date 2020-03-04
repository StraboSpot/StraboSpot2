import React from 'react';
import {View, Platform} from 'react-native';
import Modal from '../../shared/ui/modal/Modal';
import Notes from './Notes';
import styles from '../measurements/compass/compass.styles';
import DragAnimation from '../../shared/ui/DragAmination';

const ShortcutNotesModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={styles.modalPositionShortcutView}>
        <Modal
          component={<Notes onPress={props.onPress}/>}
          // style={home.compassContainer}
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
          component={<Notes />}
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

export default ShortcutNotesModal;
