import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

// import ProgressBar from 'react-native-progress/Bar';
import overlayStyles from '../../../modules/home/overlays/overlay.styles';

const ProgressModal = (props) => {

  return (
    <Overlay
      isVisible={props.isProgressModalVisible}
      animationType={'fade'}
      overlayStyle={overlayStyles.overlayContainer}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>{props.dialogTitle}</Text>
      </View>
      <View>
        {props.children}
      </View>
      <View style={overlayStyles.animationContainer}>
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
          titleStyle={overlayStyles.buttonText}
        />
      )}
    </Overlay>
  );
};

export default ProgressModal;
