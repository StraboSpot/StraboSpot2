import React from 'react';
import {Text, View} from 'react-native';
import {connect} from 'react-redux';
import {Button} from 'react-native-elements/src/index';

// Styles
import modalStyle from './modal.style';
import * as themes from '../../styles.constants';
import IconButton from '../IconButton';
import {NotebookPages} from '../../../components/notebook-panel/Notebook.constants';
import {Modals} from '../../../views/home/Home.constants';

const ModalView = (props) => {

  const renderModalBottom = () => {
    if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ) {
      return (
        <IconButton
          source={require('../../../assets/icons/StraboIcons_Oct2019/NotebookView_pressed.png')}
          style={{marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 25}}
          textStyle={{color: 'blue', fontSize: 16, textAlign: 'center'}}
          onPress={() => props.onPress(NotebookPages.MEASUREMENT)}
        >
          Go to {props.spot.properties.name}
        </IconButton>
      );
    }
    else if (props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
      return (
        <IconButton
          source={require('../../../assets/icons/StraboIcons_Oct2019/NotebookView_pressed.png')}
          style={{marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 25}}
          textStyle={{color: 'blue', fontSize: 16, textAlign: 'center'}}
          onPress={() => props.onPress(NotebookPages.SAMPLE)}
        >
          Go to {props.spot.properties.name}
        </IconButton>
      );
    }
    else return null;
  };

  return (
    <View style={modalStyle.modalContainer}>
      <View style={modalStyle.modalTop}>
        <Button
          titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
          title={props.buttonTitleRight}
          type={'clear'}
          onPress={props.onPress}
        />
        <Text style={[modalStyle.textStyle, props.textStyle]}>{props.children}</Text>
        <Button
          titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
          title={'Close'}
          type={'clear'}
          onPress={() => props.close()}
        />
      </View>
      <View style={props.style}>
        {props.component}
      </View>
      <View style={modalStyle.modalBottom}>
        {renderModalBottom()}
        {/*{props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS || props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ?*/}
        {/*  <IconButton*/}
        {/*    source={require('../../../assets/icons/StraboIcons_Oct2019/NotebookView_pressed.png')}*/}
        {/*    style={{marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 25}}*/}
        {/*    textStyle={{color: 'blue', fontSize: 16, textAlign: 'center'}}*/}
        {/*    onPress={() => props.onPress(NotebookPages.MEASUREMENT)}*/}
        {/*  >*/}
        {/*    Go to {props.spot.properties.name}*/}
        {/*  </IconButton> : null}*/}
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

export default connect(mapStateToProps)(ModalView);
