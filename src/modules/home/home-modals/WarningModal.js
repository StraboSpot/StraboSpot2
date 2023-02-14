import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import {setWarningModalVisible} from '../home.slice';
import homeStyles from '../home.style';

const WarningModal = () => {
  const dispatch = useDispatch();
  const isWarningModalVisible = useSelector(state => state.home.isWarningMessagesModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);

  const closeErrorModal = () => {
    dispatch(setWarningModalVisible(false));
  };

  return (
    <Overlay
      overlayStyle={[homeStyles.dialogBox]}
      isVisible={isWarningModalVisible}
    >
      <View style={[homeStyles.dialogTitleContainer, commonStyles.dialogWarning]}>
        <Text style={homeStyles.dialogTitleText}>Warning!</Text>
      </View>
      <Text style={commonStyles.dialogStatusMessageText}>{statusMessages.join('\n')}</Text>
      <Button
        title={'OK'}
        type={'clear'}
        onPress={closeErrorModal}
      />
    </Overlay>
  );
};

export default WarningModal;

