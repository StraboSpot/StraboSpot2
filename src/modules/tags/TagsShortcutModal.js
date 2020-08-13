import React from 'react';
import {Platform, Text, View} from 'react-native';

import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import SectionDivider from '../../shared/ui/SectionDivider';
import uiStyles from '../../shared/ui/ui.styles';
import {Modals} from '../home/home.constants';
import {NotebookPages} from '../notebook-panel/notebook.constants';
import {TagsModal} from './index';


const TagsShortcutModal = (props) => {
  const modalVisible = useSelector(state => state.home.modalVisible);
  const tags = useSelector(state => state.project.project.tags) || [];

  if (modalVisible === Modals.SHORTCUT_MODALS.TAGS && !isEmpty(tags)) {
    if (Platform.OS === 'android') {
      return (
        <View style={uiStyles.modalPositionShortcutView}>
          <Modal
            close={props.close}
            cancel={props.cancel}
            buttonTitleLeft={'Cancel'}
            textStyle={{fontWeight: 'bold'}}
            onPress={(view) => props.onPress(view, null)}
          >
          </Modal>
        </View>
      );
    }
    else {
      return (
        <DragAnimation style={uiStyles.modalPositionShortcutView}>
          <Modal
            close={props.close}
            cancel={props.cancel}
            buttonTitleLeft={'YEAH!'}
            textStyle={{fontWeight: 'bold'}}
            onPress={(view) => props.onPress(view, NotebookPages.TAG, Modals.NOTEBOOK_MODALS.TAGS)}
          >
            <TagsModal/>
          </Modal>
        </DragAnimation>
      );
    }
  }
};

export default TagsShortcutModal;
