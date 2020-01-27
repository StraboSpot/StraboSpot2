import React from 'react';
import Modal from '../../shared/ui/modal/Modal.view';
import styles from './samplesStyles/samples.style';
import Samples from './Samples.view';
import DragAnimation from '../../shared/ui/DragAmination';
import {Platform, View} from 'react-native';

const shortcutSamplesModalView = (props) => {
  if (Platform.OS === 'android') {
    return (
      <View style={styles.modalPositionShortcutView}>
        <Modal
          component={<Samples onPress={props.onPress}/>}
          style={styles.samplesContainer}
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
          component={<Samples onPress={props.onPress}/>}
          close={props.close}
          onPress={props.onPress}
          // buttonTitleRight={'Cancel'}
          // onPress={props.cancel}
          style={styles.samplesContainer}
        />
      </DragAnimation>
    );
  }
};

export default shortcutSamplesModalView;
