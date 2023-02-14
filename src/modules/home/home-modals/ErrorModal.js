import React from 'react';
import {Text} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import {setErrorMessagesModalVisible} from '../home.slice';
import homeStyles from '../home.style';

const ErrorModal = () => {
  const dispatch = useDispatch();
  const isErrorMessagesModalVisible = useSelector(state => state.home.isErrorMessagesModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);

  const closeErrorModal = () => {
    dispatch(setErrorMessagesModalVisible(false));
  };

  return (
    <Overlay
      isVisible={isErrorMessagesModalVisible}
      overlayStyle={homeStyles.dialogBox}
    >
      <Text style={[commonStyles.dialogStatusMessageText, commonStyles.dialogError]}>{statusMessages.join('\n')}</Text>
      <Button
        title={'OK'}
        type={'clear'}
        onPress={closeErrorModal}
      />
    </Overlay>
  );
};

export default ErrorModal;

