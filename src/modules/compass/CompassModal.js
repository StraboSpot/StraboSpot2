import React from 'react';
import {Platform, View, Text} from 'react-native';

import {Overlay, Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import * as themes from '../../shared/styles.constants';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import modalStyle from '../../shared/ui/modal/modal.style';
import uiStyles from '../../shared/ui/ui.styles';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import Compass from './Compass';
import {setCompassMeasurements} from './compass.slice';

const CompassModal = (props) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);

  const closeCompassModal = () => {
    dispatch(setModalVisible({modal: null}));
    dispatch(setCompassMeasurements({}));
  };

  const renderCompassModalContent = () => {
    return (
      <Modal
        close={closeCompassModal}
        textStyle={{fontWeight: 'bold'}}
        onPress={props.onPress}
        style={props.type === MODALS.NOTEBOOK_MODALS.COMPASS ? uiStyles.modalPosition : uiStyles.modalPositionShortcutView}
      >
        <Compass/>
      </Modal>
    );
  };

  const renderFixedCompassModal = () => {
    return (
      <View>
        <Overlay
          isVisible={modalVisible === 'Compass'}
          overlayStyle={props.type === MODALS.NOTEBOOK_MODALS.COMPASS ? {
            ...uiStyles.modalPosition,
            width: 250,
            borderRadius: 20,
          } : uiStyles.modalPositionShortcutView}
        >
          <View style={modalStyle.modalTop}>
            <View style={{flex: 1, alignItems: 'flex-start'}}>
              <Button
                titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
                title={props.buttonTitleLeft}
                type={'clear'}
                onPress={props.cancel}
              />
            </View>
            <Text style={modalStyle.modalTitle}>Compass</Text>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <Button title={'Close'} type={'clear'} onPress={() => closeCompassModal()}/>
            </View>
          </View>
          <Compass/>

        </Overlay>
      </View>
    );
  };

  if (Platform.OS === 'android') return renderCompassModalContent();
  // else return <DragAnimation>{renderCompassModalContent()}</DragAnimation>;
  else return renderFixedCompassModal();
};

export default CompassModal;
