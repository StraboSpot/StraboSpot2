import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import modalStyle from './modal.style';
import {setModalVisible} from '../../../modules/home/home.slice';
import {MODALS, NOTEBOOK_PAGES, PAGE_KEYS} from '../../../modules/page/page.constants';
import * as themes from '../../styles.constants';

const ModalHeader = ({
                       buttonTitleLeft,
                       buttonTitleRight,
                       cancel,
                       closeModal,
                       title,
                     }) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const pageVisible = useSelector(state => state.notebook.visibleNotebookPagesStack.slice(-1)[0]);

  const modalInfo = MODALS.find(p => p.key === modalVisible);

  const getTitle = () => {
    if (pageVisible === PAGE_KEYS.GEOLOGIC_UNITS) {
      return NOTEBOOK_PAGES.find(p => p.key === PAGE_KEYS.GEOLOGIC_UNITS).action_label;
    }
    else return modalInfo && (modalInfo.action_label || modalInfo.label);
  };

  return (
    <View style={modalStyle.modalTop}>
      <View style={modalStyle.modalHeaderContainer}>
        <View style={modalStyle.modalHeaderButtonsContainer}>
          <Button
            titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
            title={buttonTitleLeft}
            type={'clear'}
            onPress={cancel}
            buttonStyle={{padding: 0}}
          />
          <Button
            titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
            title={buttonTitleRight === '' ? '' : buttonTitleRight || 'Close'}
            type={'clear'}
            onPress={closeModal || (() => dispatch(setModalVisible({modal: null})))}
          />
        </View>
        <Text style={modalStyle.modalTitle}>{title || getTitle()}</Text>
      </View>
    </View>
  );
};

export default ModalHeader;
