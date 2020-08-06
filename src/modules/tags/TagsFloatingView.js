import React from 'react';
import {Platform, View} from 'react-native';

import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import {Modals} from '../home/home.constants';
import compassStyles from '../measurements/compass/compass.styles';
import {Tags, TagsModal} from '../tags';

const TagsFloatingView = (props) => {

  const modalVisible = useSelector(state => state.home.modalVisible);
  const tags = useSelector(state => state.project.project.tags);

  if (modalVisible === Modals.NOTEBOOK_MODALS.TAGS && !isEmpty(tags)) {
    if (Platform.OS === 'android') {
      return (
        <View style={compassStyles.modalPosition}>
          <Modal
            close={props.close}
            buttonTitleLeft={'Cancel'}
            textStyle={{fontWeight: 'bold'}}
            onPress={props.onPress}
          >
            <TagsModal/>
          </Modal>
        </View>
      );
    }
    else {
      return (
        <DragAnimation style={compassStyles.modalPosition}>
          <Modal
            close={props.close}
            buttonTitleLeft={'Cancel'}
            textStyle={{fontWeight: 'bold'}}
            onPress={props.onPress}
          >
            <TagsModal/>
          </Modal>
        </DragAnimation>
      );
    }
  }
  else {
    if (Platform.OS === 'android') {
      return (
        <View style={compassStyles.modalPositionShortcutView}>
          <Modal
            close={props.close}
            buttonTitleLeft={'Cancel'}
            textStyle={{fontWeight: 'bold'}}
            onPress={props.onPress}
          >
            <TagsModal/>
          </Modal>
        </View>
      );
    }
    else {
      return (
        <DragAnimation style={compassStyles.modalPositionShortcutView}>
          <Modal
            close={props.close}
            buttonTitleLeft={'Cancel'}
            textStyle={{fontWeight: 'bold'}}
            onPress={props.onPress}
          >
            <TagsModal/>
          </Modal>
        </DragAnimation>
      );
    }
  }
};

export default TagsFloatingView;
