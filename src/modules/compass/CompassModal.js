import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import Modal from '../../shared/ui/modal/Modal';
import modalStyle from '../../shared/ui/modal/modal.style';
import {setModalVisible} from '../home/home.slice';
import Compass from './Compass';
import {setCompassMeasurements} from './compass.slice';

const CompassModal = (props) => {
  const dispatch = useDispatch();

  const closeCompassModal = () => {
    dispatch(setModalVisible({modal: null}));
    dispatch(setCompassMeasurements({}));
  };

  return (
    <Modal onPress={props.onPress}>
      <Compass goToCurrentLocation={props.goToCurrentLocation}/>
    </Modal>
  );
};

export default CompassModal;
