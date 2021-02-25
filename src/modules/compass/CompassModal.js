import React from 'react';
import {Platform} from 'react-native';

import {useDispatch} from 'react-redux';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import Compass from './Compass';
import {setCompassMeasurements} from './compass.slice';

const CompassModal = (props) => {
  const dispatch = useDispatch();

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

  if (Platform.OS === 'android') return renderCompassModalContent();
  else return <DragAnimation>{renderCompassModalContent()}</DragAnimation>;
};

export default CompassModal;
