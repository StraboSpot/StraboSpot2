import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import StatusDialogBox from '../../../shared/ui/StatusDialogBox';
import {setWarningModalVisible} from '../home.slice';
import overlayStyles from '../overlay.styles';


const WarningModal = ({children, closeModal, closeTitle, confirmText, confirmTitleStyle, isVisible, showConfirm, onPress}) => {

  const dispatch = useDispatch();
  const isWarningModalVisible = useSelector(state => state.home.isWarningMessagesModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);

  const closeWarningModal = () => {
    dispatch(setWarningModalVisible(false));
  };

  return (
    <StatusDialogBox
      title={'Warning!'}
      overlayTitleText={overlayStyles.titleTextWarning}
      visible={isVisible || isWarningModalVisible}
    >
      <Text style={overlayStyles.statusMessageText}>{children || statusMessages.join('\n')}</Text>
      <View style={overlayStyles.buttonContainer}>
        <Button
          title={closeTitle || 'Close'}
          type={'clear'}
          onPress={closeModal || closeWarningModal}
        />
        {showConfirm && <Button
          title={confirmText || 'Confirm'}
          titleStyle={confirmTitleStyle}
          type={'clear'}
          onPress={onPress}
        />}
      </View>
    </StatusDialogBox>
  );
};

export default WarningModal;
