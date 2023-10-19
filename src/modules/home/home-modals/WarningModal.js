import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import StatusDialogBox from '../../../shared/ui/StatusDialogBox';
import {setWarningModalVisible} from '../home.slice';
import overlayStyles from '../overlay.styles';


const WarningModal = (props) => {
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
      visible={props.isVisible || isWarningModalVisible}
    >
      <Text style={overlayStyles.statusMessageText}>{statusMessages.join('\n')}</Text>
      {props.children}
      <View style={overlayStyles.buttonContainer}>
        <Button
          title={'Close'}
          type={'clear'}
          onPress={props.closeModal || closeWarningModal}
        />
        {props.showConfirm && <Button
          title={props.confirmText || 'Confirm'}
          titleStyle={props.titleStyle}
          type={'clear'}
          onPress={props.onPress}
        />}
      </View>
    </StatusDialogBox>
  );
};

export default WarningModal;
