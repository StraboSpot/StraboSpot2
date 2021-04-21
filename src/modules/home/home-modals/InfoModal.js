import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import StatusDialogBox from '../../../shared/ui/StatusDialogBox';
import {setInfoMessagesModalVisible} from '../home.slice';


const InfoModal = () => {
  const dispatch = useDispatch();
  const isInfoMessagesModalVisible = useSelector(state => state.home.isInfoModalVisible);
  const statusMessages = useSelector(state => state.home.statusMessages);

  return (
    <StatusDialogBox
      dialogTitle={'Status Info'}
      style={commonStyles.dialogWarning}
      visible={isInfoMessagesModalVisible}
      // onTouchOutside={() => dispatch(setInfoMessagesModalVisible(false))}
    >
      <View style={{margin: 15}}>
        <Text style={commonStyles.dialogStatusMessageText}>{statusMessages.join('\n')}</Text>
      </View>
      <Button
        title={'OK'}
        type={'clear'}
        onPress={() => dispatch(setInfoMessagesModalVisible(false))}
      />
    </StatusDialogBox>
  );
};

export default InfoModal;
