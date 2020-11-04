import React from 'react';
import {Platform, View} from 'react-native';

import DragAnimation from '../../../shared/ui/DragAmination';
import Modal from '../../../shared/ui/modal/Modal';
import compassStyles from './compass.styles';
import RMCompass from './RMCompass';

const NotebookCompassModal = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={compassStyles.modalPosition}>
        <Modal
          close={props.close}
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
          onPress={props.onPress}
        >
          <RMCompass/>
        </Modal>
      </View>
    );
  }
  else {
    return (
      <DragAnimation style={compassStyles.modalPosition}>
        <Modal
          close={props.close}
          buttonTitleLeft={'Undo'}
          textStyle={{fontWeight: 'bold'}}
          onPress={props.onPress}
        >
          <RMCompass/>
        </Modal>
      </DragAnimation>
    );
  }
};

export default NotebookCompassModal;
