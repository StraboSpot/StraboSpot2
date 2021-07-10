import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import modalStyle from '../../shared/ui/modal/modal.style';
import {setModalVisible} from '../home/home.slice';
import Compass from './Compass';
import {setCompassMeasurements} from './compass.slice';

const CompassModal = () => {
  const dispatch = useDispatch();

  const closeCompassModal = () => {
    dispatch(setModalVisible({modal: null}));
    dispatch(setCompassMeasurements({}));
  };

  return (
    <Overlay overlayStyle={[modalStyle.modalPosition, {width: 250}]}>
      <View style={modalStyle.modalTop}>
        <View style={{flex: 1, alignItems: 'flex-start'}}/>
        <Text style={modalStyle.modalTitle}>Take a Measurement</Text>
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Button title={'Close'} type={'clear'} onPress={() => closeCompassModal()}/>
        </View>
      </View>
      <Compass/>
    </Overlay>
  );
};

export default CompassModal;
