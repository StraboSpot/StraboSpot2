import React from 'react';
import {Platform} from 'react-native';

import {useSelector} from 'react-redux';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {MODALS} from '../home/home.constants';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {TagsModal} from './index';

const TagsShortcutModal = (props) => {
  const modalVisible = useSelector(state => state.home.modalVisible);

  if (modalVisible === MODALS.SHORTCUT_MODALS.TAGS) {
    if (Platform.OS === 'android') {
      return (
        <Modal
          style={{...uiStyles.modalPositionShortcutView, width: 285}}
          close={props.close}
          cancel={props.cancel}
          buttonTitleLeft={'Cancel'}
          textStyle={{fontWeight: 'bold'}}
          onPress={(view) => props.onPress(view, NOTEBOOK_PAGES.TAG, MODALS.NOTEBOOK_MODALS.TAGS)}
        >
          <TagsModal/>
        </Modal>
      );
    }
    else {
      return (
        <DragAnimation>
          <Modal
            style={{...uiStyles.modalPositionShortcutView, width: 285}}
            close={props.close}
            // cancel={props.cancel}
            // buttonTitleLeft={'Cancel'}
            textStyle={{fontWeight: 'bold'}}
            onPress={(view) => props.onPress(view, NOTEBOOK_PAGES.TAG, MODALS.NOTEBOOK_MODALS.TAGS)}
          >
            <TagsModal/>
          </Modal>
        </DragAnimation>
      );
    }
  }
};

export default TagsShortcutModal;
