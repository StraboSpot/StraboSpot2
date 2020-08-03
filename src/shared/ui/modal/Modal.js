import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {connect, useSelector} from 'react-redux';

import {Modals} from '../../../modules/home/home.constants';
import {NotebookPages} from '../../../modules/notebook-panel/notebook.constants';
import {isEmpty} from '../../Helpers';
import * as themes from '../../styles.constants';
import IconButton from '../IconButton';
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
        <IconButton
          source={require('../../../assets/icons/NotebookView_pressed.png')}
          style={{marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 25}}
          textStyle={{color: 'blue', fontSize: 16, textAlign: 'center'}}
          onPress={() => props.onPress(NotebookPages.MEASUREMENT)}
        >
          Go to Last Spot Created
        </IconButton>
      );
    }
    else if (props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE && !isEmpty(props.spot)) {
      return (
        <IconButton
          source={require('../../../assets/icons/NotebookView_pressed.png')}
          style={{marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 25}}
          textStyle={{color: 'blue', fontSize: 16, textAlign: 'center'}}
          onPress={() => props.onPress(NotebookPages.SAMPLE)}
        >
          Go to {props.spot.properties.name}
        </IconButton>
      );
    }
    else if (props.modalVisible === Modals.SHORTCUT_MODALS.NOTES && !isEmpty(props.spot)) {
      return (
        <IconButton
          source={require('../../../assets/icons/NotebookView_pressed.png')}
          style={{marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 25}}
          textStyle={{color: 'blue', fontSize: 16, textAlign: 'center'}}
          onPress={() => props.onPress(NotebookPages.OVERVIEW)}
        >
          Go to {props.spot.properties.name}
        </IconButton>
      );
    }
    else {
      return (
        <View style={{alignItems: 'center'}}>
          {props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ?
            <Text style={{fontWeight: '400'}}>Take a measurement first</Text> : null}
        </View>
      );
    }
  };

  return (
    <View style={modalStyle.modalContainer}>
      {renderModalHeader()}
      <View style={props.style}>
        {props.component}
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
