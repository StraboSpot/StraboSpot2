import React from 'react';
import {View, Platform} from 'react-native';

import DragAnimation from '../../../shared/ui/DragAmination';
import Modal from '../../../shared/ui/modal/Modal';
import compassStyles from './compass.styles';
import RMCompass from './RMCompass';

const ShortcutCompassModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={compassStyles.modalPositionShortcutView}>
        <Modal
          close={props.close}
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
        >
          <RMCompass/>
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
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
        >
          <RMCompass/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default ShortcutCompassModal;
