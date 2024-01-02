import React from 'react';
import {Text} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import StatusDialogBox from '../../../shared/ui/StatusDialogBox';
import {setWarningModalVisible} from '../home.slice';
import overlayStyles from '../overlays/overlay.styles';

const WarningModal = ({
                        children,
                        closeModal,
                        closeTitle,
                        confirmText,
                        confirmTitleStyle,
                        isVisible,
                        onConfirmPress,
                        showCancelButton,
                        showConfirmButton,
                        title,
                      }) => {
  const dispatch = useDispatch();
  const isWarningModalVisible = useSelector(state => state.home.isWarningMessagesModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);

  const closeWarningModal = () => {
    dispatch(setWarningModalVisible(false));
  };

  return (
    <StatusDialogBox
      closeModal={closeModal}
      closeTitle={closeTitle}
      confirmText={confirmText}
      confirmTitleStyle={confirmTitleStyle}
      isVisible={isVisible || isWarningModalVisible}
      onConfirmPress={onConfirmPress || closeWarningModal}
      overlayTitleText={overlayStyles.titleTextWarning}
      showCancelButton={showCancelButton}
      showConfirmButton={showConfirmButton || !showCancelButton}
      title={title || 'Warning!'}
    >
      <Text style={overlayStyles.statusMessageText}>{children || statusMessages.join('\n')}</Text>
    </StatusDialogBox>
  );
};

export default WarningModal;
