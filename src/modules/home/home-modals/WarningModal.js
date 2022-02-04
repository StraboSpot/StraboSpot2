import React from 'react';
import {Text} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import StatusDialogBox from '../../../shared/ui/StatusDialogBox';
import {setErrorMessagesModalVisible, setStatusMessagesModalVisible, setWarningModalVisible} from '../home.slice';


const WarningModal = () => {
  const dispatch = useDispatch();
  const isWarningModalVisible = useSelector(state => state.home.isWarningMessagesModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);

  const closeErrorModal = () => {
    dispatch(setWarningModalVisible(false));
  };

  return (
    <StatusDialogBox
      dialogTitle={'Warning!'}
      style={commonStyles.dialogWarning}
      visible={isWarningModalVisible}
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

export default WarningModal;

