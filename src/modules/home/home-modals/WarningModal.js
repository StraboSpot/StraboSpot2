import React from 'react';
import {Text} from 'react-native';

import {useSelector} from 'react-redux';

import StatusDialogBox from '../../../shared/ui/StatusDialogBox';
import overlayStyles from '../overlay.styles';


const WarningModal = ({children, closeModal, showCancelButton, title, closeTitle, confirmText, confirmTitleStyle, onConfirmPress, isVisible, showConfirmButton}) => {

  const isWarningModalVisible = useSelector(state => state.home.isWarningMessagesModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);

  return (
    <StatusDialogBox
      title={title}
      isVisible={isVisible || isWarningModalVisible}
      confirmText={confirmText}
      showConfirmButton={showConfirmButton}
      showCancelButton={showCancelButton}
      closeModal={closeModal}
      onConfirmPress={onConfirmPress}
      confirmTitleStyle={confirmTitleStyle}
      closeTitle={closeTitle}
    >
      <Text style={overlayStyles.statusMessageText}>{children || statusMessages.join('\n')}</Text>
    </StatusDialogBox>
  );
};

export default WarningModal;
