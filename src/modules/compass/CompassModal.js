import React, {useState} from 'react';

import {useDispatch} from 'react-redux';

import Modal from '../../shared/ui/modal/Modal';
import {setModalVisible} from '../home/home.slice';
import Templates from '../templates/Templates';
import Compass from './Compass';
import {setCompassMeasurements} from './compass.slice';

const CompassModal = (props) => {
  const dispatch = useDispatch();

  const [isShowTemplates, setIsShowTemplates] = useState(false);

  const closeCompassModal = () => {
    if (isShowTemplates) setIsShowTemplates(false);
    else {
      dispatch(setModalVisible({modal: null}));
      dispatch(setCompassMeasurements({}));
      props.showCompassDataModal(false);
    }
  };

  return (
    <Modal
      close={closeCompassModal}
      onPress={props.onPress}
      buttonTitleRight={isShowTemplates && ''}
    >
      <Templates
        isShowTemplates={isShowTemplates}
        setIsShowTemplates={bool => setIsShowTemplates(bool)}
      />
      {!isShowTemplates
      && (
        <Compass
          goToCurrentLocation={props.goToCurrentLocation}
          showCompassDataModal={props.showCompassDataModal}
          compassData={props.compassData}
          compassDataButtonTitle={props.compassDataButtonTitle}
        />
      )}
    </Modal>
  );
};

export default CompassModal;
