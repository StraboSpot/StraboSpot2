import React from 'react';
import {Text} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import StatusDialogBox from '../../../shared/ui/StatusDialogBox';
import {setErrorMessagesModalVisible} from '../home.slice';
import overlayStyles from '../overlay.styles';


const ErrorModal = () => {
  const dispatch = useDispatch();
  const isErrorMessagesModalVisible = useSelector(state => state.home.isErrorMessagesModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);

  const closeErrorModal = () => {
    dispatch(setErrorMessagesModalVisible(false));
  };

  return (
    <StatusDialogBox
      title={'Error!'}
      visible={isErrorMessagesModalVisible}
      overlayTitleText={overlayStyles.titleTextError}
    >
      <Text style={overlayStyles.statusMessageText}>{statusMessages.join('\n')}</Text>
      <Button
        title={'OK'}
        type={'clear'}
        onPress={closeErrorModal}
      />
    </StatusDialogBox>
  );
};

export default ErrorModal;
