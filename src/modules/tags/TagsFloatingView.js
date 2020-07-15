import React from 'react';
import {Platform, View} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import styles from '../measurements/compass/compass.styles';
import {useSelector} from 'react-redux';
import {Modals} from '../home/home.constants';
import Samples from '../samples/Samples';
import {TagsModal} from '../tags';

const TagsFloatingView = (props) => {

  const tagsModal = useSelector(state => state.project.project.tags);
  const modalVisible = useSelector(state => state.home.modalVisible);

  if (modalVisible === Modals.NOTEBOOK_MODALS.TAGS){
    if (Platform.OS === 'android') {
      return (
        <View style={styles.modalPosition}>
          <Modal
            component={<TagsModal onPress={props.onPress}/>}
            style={styles.compassContainer}
            close={props.close}
            buttonTitleLeft={'Undo last'}
            textStyle={{fontWeight: 'bold'}}
          />
        </View>
      );
    }
    else {
      return (
        <DragAnimation style={styles.modalPosition}>
          <Modal
            component={<TagsModal onPress={props.onPress}/>}
            style={styles.compassContainer}
            close={props.close}
            buttonTitleLeft={'Cancel'}
            textStyle={{fontWeight: 'bold'}}
          />
        </DragAnimation>
      );
    }
  }
  else {
    if (Platform.OS === 'android') {
      return (
        <View style={styles.modalPositionShortcutView}>
          <Modal
            component={<Tags onPress={props.onPress}/>}
            style={styles.compassContainer}
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
            component={<Samples onPress={props.onPress}/>}
            style={styles.compassContainer}
            close={props.close}
            buttonTitleLeft={'Cancel'}
            textStyle={{fontWeight: 'bold'}}
          />
        </DragAnimation>
      );
    }
  }
};

export default TagsFloatingView;
