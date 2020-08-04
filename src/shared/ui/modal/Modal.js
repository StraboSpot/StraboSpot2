import React, {useEffect, useState} from 'react';
import {Image, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {connect, useSelector} from 'react-redux';

import {Modals} from '../../../modules/home/home.constants';
import {NotebookPages} from '../../../modules/notebook-panel/notebook.constants';
import {isEmpty} from '../../Helpers';
import * as themes from '../../styles.constants';
import modalStyle from './modal.style';

const Modal = (props) => {
  const [modalTitle, setModalTitle] = useState('');
  const modalVivible = useSelector(state => state.home.modalVisible);

  useEffect(() => {
    if (modalVivible === Modals.NOTEBOOK_MODALS.TAGS ||
      modalVivible === Modals.SHORTCUT_MODALS.TAGS) setModalTitle('Tags');
    if (modalVivible === Modals.NOTEBOOK_MODALS.COMPASS ||
      modalVivible === Modals.SHORTCUT_MODALS.COMPASS) setModalTitle('Compass');
    if (modalVivible === Modals.NOTEBOOK_MODALS.SAMPLE ||
      modalVivible === Modals.SHORTCUT_MODALS.SAMPLE) setModalTitle('Sample');
    if (modalVivible === Modals.SHORTCUT_MODALS.NOTES) setModalTitle('Notes');
  }, []);

  const renderModalHeader = () => {
    return (
      <View style={modalStyle.modalTop}>
        <View style={{flex: 1, alignItems: 'flex-start'}}>
          <Button
            titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
            title={props.buttonTitleLeft}
            type={'clear'}
            onPress={props.onPress}
          />
        </View>
        <View>
          <Text style={modalStyle.modalTitle}>{modalTitle}</Text>
        </View>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Button
            titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
            title={'Close'}
            type={'clear'}
            onPress={() => props.close()}
          />
        </View>
      </View>
    );
  };

  const renderModalBottom = () => {
    if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS && !isEmpty(props.spot)) {
      return (
        <View style={modalStyle.modalBottom}>
          <ListItem
            containerStyle={modalStyle.modalBottom}
            title={'Go to last spot created'}
            titleStyle={modalStyle.textStyle}
            onPress={() => props.onPress(NotebookPages.MEASUREMENT)}
            chevron={{name: 'right', type: 'antdesign', color: themes.LIST_CHEVRON_COLOR, size: 16}}
            leftIcon={
              <Image
                target={props.name}
                source={require('../../../assets/icons/NotebookView_pressed.png')}
                style={modalStyle.icon}
              />
            }
          />
        </View>
      );
    }
    else if (props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE && !isEmpty(props.spot)) {
      return (
        <ListItem
          containerStyle={modalStyle.modalBottom}
          title={'Go to last spot created'}
          titleStyle={modalStyle.textStyle}
          onPress={() => props.onPress(NotebookPages.SAMPLE)}
          chevron={{name: 'right', type: 'antdesign', color: themes.LIST_CHEVRON_COLOR, size: 16}}
          leftIcon={
            <Image
              target={props.name}
              source={require('../../../assets/icons/NotebookView_pressed.png')}
              style={modalStyle.icon}
            />
          }
        />
      );
    }
    else if (props.modalVisible === Modals.SHORTCUT_MODALS.NOTES && !isEmpty(props.spot)) {
      return (
        <ListItem
          containerStyle={modalStyle.modalBottom}
          title={'Go to last spot created'}
          titleStyle={modalStyle.textStyle}
          onPress={() => props.onPress(NotebookPages.NOTE)}
          chevron={{name: 'right', type: 'antdesign', color: themes.LIST_CHEVRON_COLOR, size: 16}}
          leftIcon={
            <Image
              target={props.name}
              source={require('../../../assets/icons/NotebookView_pressed.png')}
              style={modalStyle.icon}
            />
          }
        />
      );
    }
    else {
      return (
        <View style={{alignItems: 'center', paddingBottom: 20}}>
          {props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ?
            <Text style={{fontWeight: '400'}}>Take a measurement first</Text> : null}
        </View>
      );
    }
  };

  return (
    <View style={modalStyle.modalContainer}>
      {renderModalHeader()}
      <View>
        {props.children}
      </View>
      <View style={modalStyle.modalBottom}>
        {renderModalBottom()}
      </View>
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot,
    isNotebookPanelVisible: state.notebook.isNotebookPanelVisible,
    modalVisible: state.home.modalVisible,
    deviceDimensions: state.home.deviceDimensions,
  };
};

export default connect(mapStateToProps)(Modal);
