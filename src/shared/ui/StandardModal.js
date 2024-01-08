import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import overlayStyles from '../../modules/home/overlays/overlay.styles';

const StandardModal = ({
                         children,
                         closeModal,
                         dialogTitle,
                         footerButtonsVisible,
                         leftButtonText,
                         onPress,
                         onTouchOutside,
                         rightButtonText,
                         visible,
                       }) => {
  return (
    <Overlay
      animationType={'fade'}
      isVisible={visible}
      overlayStyle={overlayStyles.overlayContainer}
      onBackdropPress={onTouchOutside}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>{dialogTitle}</Text>
      </View>
      <View style={overlayStyles.overlayContent}>
        {children}
      </View>
      {footerButtonsVisible && (
        <View style={overlayStyles.buttonContainer}>
          <Button
            title={rightButtonText || 'OK'}
            type={'clear'}
            titleStyle={overlayStyles.buttonText}
            onPress={onPress}
          />
          <Button
            title={leftButtonText || 'Cancel'}
            titleStyle={overlayStyles.buttonText}
            type={'clear'}
            onPress={closeModal}
          />
        </View>
      )}
    </Overlay>
  );
};

export default StandardModal;
