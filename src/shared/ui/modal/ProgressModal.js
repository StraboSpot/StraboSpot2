import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

// import ProgressBar from 'react-native-progress/Bar';
import commonStyles from '../../common.styles';

const ProgressModal = (props) => {

  return (
    <Overlay
      isVisible={props.isProgressModalVisible}
      animationType={'fade'}
      overlayStyle={[
        // homeStyles.dialogBox,
        commonStyles.dialogBox,
        // {maxHeight: Platform.OS === 'ios' ? 700 : 275, width: 300},
      ]}
    >
      <View style={commonStyles.overlayTitleContainer}>
        <Text style={commonStyles.overlayTitleText}>{props.dialogTitle}</Text>
      </View>
      <View style={{...commonStyles.dialogContent}}>
        {props.children}
      </View>
      <View style={{height: 150, marginBottom: 20}}>
        {props.animation}
      </View>

      {props.showInfo && (
        <View style={{flex: 1}}>
          {props.info}
        </View>
      )}
      {props.showButton && (
        <Button
          disabled={props.disabled}
          onPress={props.onPressComplete}
          type={'clear'}
          title={props.buttonText || 'OK'}
          titleStyle={commonStyles.dialogButtonText}
        />
      )}
    </Overlay>
  );
};

export default ProgressModal;
