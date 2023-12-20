import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import overlayStyles from '../../modules/home/overlays/overlay.styles';

const StandardModal = (props) => {
  return (
    <Overlay
      animationType={'fade'}
      isVisible={props.visible}
      overlayStyle={overlayStyles.overlayContainer}
      onBackdropPress={props.onTouchOutside}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>{props.dialogTitle}</Text>
      </View>
      <View style={overlayStyles.overlayContent}>
        {props.children}
      </View>
      {props.footerButtonsVisible && (
        <View style={overlayStyles.buttonContainer}>
          <Button
            title={props.rightButtonText || 'OK'}
            type={'clear'}
            titleStyle={overlayStyles.buttonText}
            onPress={props.onPress}
          />
          <Button
            title={props.leftButtonText || 'Cancel'}
            titleStyle={overlayStyles.buttonText}
            type={'clear'}
            onPress={props.close}
          />
        </View>
      )}
    </Overlay>
  );
};

export default StandardModal;
