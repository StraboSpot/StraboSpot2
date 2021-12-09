import React from 'react';
import {Text} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import StatusDialogBox from '../../../shared/ui/StatusDialogBox';
import {setErrorMessagesModalVisible, setStatusMessagesModalVisible} from '../home.slice';


const ErrorModal = () => {
  const dispatch = useDispatch();
  const isErrorMessagesModalVisible = useSelector(state => state.home.isErrorMessagesModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);

  const closeErrorModal = () => {
    dispatch(setErrorMessagesModalVisible(false));
  };

  return (
    <StatusDialogBox
      dialogTitle={'Error!'}
      style={commonStyles.dialogError}
      visible={isErrorMessagesModalVisible}
    >
      <Text style={commonStyles.dialogStatusMessageText}>{statusMessages.join('\n')}</Text>
      <Button
        title={'OK'}
        type={'clear'}
        onPress={closeErrorModal}
      />
    </StatusDialogBox>
  );
};

export default ErrorModal;

