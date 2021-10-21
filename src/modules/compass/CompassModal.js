import React, {useState} from 'react';

import {useDispatch} from 'react-redux';

import Modal from '../../shared/ui/modal/Modal';
import {setModalVisible} from '../home/home.slice';
import Templates from '../templates/Templates';
import Compass from './Compass';
import {setCompassMeasurements} from './compass.slice';

const CompassModal = (props) => {
  const dispatch = useDispatch();

  const [isShowTemplatesList, setIsShowTemplatesList] = useState(false);

  const closeCompassModal = () => {
    if (isShowTemplatesList) setIsShowTemplatesList(false);
    else {
      dispatch(setModalVisible({modal: null}));
      dispatch(setCompassMeasurements({}));
    }
  };

  return (
    <Modal
      close={closeCompassModal}
      onPress={props.onPress}
      buttonTitleRight={isShowTemplatesList && 'Done'}
    >
      <Templates
        isShowTemplates={isShowTemplatesList}
        setIsShowTemplates={bool => setIsShowTemplatesList(bool)}
      />
      {!isShowTemplatesList && <Compass goToCurrentLocation={props.goToCurrentLocation}/>}
    </Modal>
  );
};

export default CompassModal;
