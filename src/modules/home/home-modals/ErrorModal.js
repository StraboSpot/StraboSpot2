import React from 'react';
import {Text} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import StatusDialogBox from '../../../shared/ui/StatusDialogBox';
import {setErrorMessagesModalVisible} from '../home.slice';
import overlayStyles from '../overlay.styles';


const ErrorModal = ({closeModal, children, isVisible}) => {
  const dispatch = useDispatch();
  const isErrorMessagesModalVisible = useSelector(state => state.home.isErrorMessagesModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);

  const closeErrorModal = () => {
    dispatch(setErrorMessagesModalVisible(false));
  };

  return (
    <StatusDialogBox
      title={'Error!'}
      isVisible={isVisible || isErrorMessagesModalVisible}
      overlayTitleText={overlayStyles.titleTextError}
      closeModal={closeModal || closeErrorModal}
      showCancelButton={true}
    >
      <Text style={overlayStyles.statusMessageText}>{children || statusMessages.join('\n')}</Text>
    </StatusDialogBox>
  );
};

export default ErrorModal;
