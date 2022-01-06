import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {MODALS} from '../../../modules/home/home.constants';
import {setModalVisible} from '../../../modules/home/home.slice';
import {NOTEBOOK_PAGES, PAGE_KEYS} from '../../../modules/page/page.constants';
import * as themes from '../../styles.constants';
import modalStyle from './modal.style';

const ModalHeader = (props) => {
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
      <View style={{flex: 1, flexDirection: 'column', padding: 10, paddingTop: 5}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1, alignItems: 'flex-start'}}>
            <Button
              titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
              title={props.buttonTitleLeft}
              type={'clear'}
              onPress={props.cancel}
              buttonStyle={{padding: 0}}
            />
          </View>
          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Button
              titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
              title={props.buttonTitleRight === '' ? '' : props.buttonTitleRight || 'Close'}
              type={'clear'}
              onPress={props.close || (() => dispatch(setModalVisible({modal: null})))}
              buttonStyle={{padding: 0}}
            />
          </View>
        </View>
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text style={modalStyle.modalTitle}>{props.title || getTitle()}</Text>
        </View>
      </View>
    </View>
  );
};

export default ModalHeader;
