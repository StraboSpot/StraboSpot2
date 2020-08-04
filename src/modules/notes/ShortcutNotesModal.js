import React from 'react';
import {View, Platform} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import compassStyles from '../measurements/compass/compass.styles';
import Notes from './Notes';

const ShortcutNotesModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={compassStyles.modalPositionShortcutView}>
        <Modal
          close={props.close}
          onPress={props.onPress}
          textStyle={{fontWeight: 'bold'}}
        >
          <Notes/>
        </Modal>
      </View>
    );
  }
  else {
    return (
      <DragAnimation style={compassStyles.modalPositionShortcutView}>
        <Modal
          close={props.close}
          onPress={props.onPress}
          textStyle={{fontWeight: 'bold'}}
        >
          <Notes/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default ShortcutNotesModal;
