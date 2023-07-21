import React from 'react';
import {Text} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import StatusDialogBox from '../../../shared/ui/StatusDialogBox';
import {setWarningModalVisible} from '../home.slice';
import overlayStyles from '../overlay.styles';


const WarningModal = () => {
  const dispatch = useDispatch();
  const isWarningModalVisible = useSelector(state => state.home.isWarningMessagesModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);

  const closeErrorModal = () => {
    dispatch(setWarningModalVisible(false));
  };

  return (
    <StatusDialogBox
      title={'Warning!'}
      overlayTitleText={overlayStyles.titleTextWarning}
      visible={isWarningModalVisible}
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

export default WarningModal;
