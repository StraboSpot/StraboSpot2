import React from 'react';
import {Platform, View} from 'react-native';

import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {Modals} from '../home/home.constants';
import {TagsModal} from '../tags';

const TagsNotebookModal = (props) => {

  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const tags = useSelector(state => state.project.project.tags) || [];

  if (modalVisible === Modals.NOTEBOOK_MODALS.TAGS && !isEmpty(tags) && !isEmpty(selectedSpot)) {
    if (Platform.OS === 'android') {
      return (
        <View style={uiStyles.modalPosition}>
          <Modal
            close={props.close}
            cancel={props.cancel}
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
        <DragAnimation style={uiStyles.modalPosition}>
          <Modal
            close={props.close}
            cancel={props.cancel}
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

export default TagsNotebookModal;
