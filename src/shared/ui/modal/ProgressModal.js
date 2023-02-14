import React from 'react';
import {Platform, Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

// import ProgressBar from 'react-native-progress/Bar';
import homeStyles from '../../../modules/home/home.style';
import commonStyles from '../../common.styles';

const ProgressModal = (props) => {

  return (
    <Overlay
      isVisible={props.isProgressModalVisible}
      animationType={'slide'}
      overlayStyle={[
        homeStyles.dialogBox,
        commonStyles.dialogBox,
        {maxHeight: Platform.OS === 'ios' ? 400 : 275, width: 300},
      ]}
    >
      <View style={[homeStyles.dialogTitleContainer, commonStyles.dialogTitleContainer]}>
        <Text style={[homeStyles.dialogTitleText, {fontSize: 25}]}>{props.dialogTitle}</Text>
      </View>
      <View style={{...commonStyles.dialogContent}}>
        {props.children}
      </View>
      <View style={{height: 150, marginBottom: 20}}>
        {props.animation}
      </View>
      {props.showButton && (
        <Button
          disabled={props.disabled}
          onPress={props.onPressComplete}
          title={props.buttonText || 'OK'}
          titleStyle={commonStyles.dialogButtonText}
        />
      )}
    </Overlay>
  );
};

export default ProgressModal;
