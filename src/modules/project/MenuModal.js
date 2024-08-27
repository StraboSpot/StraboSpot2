import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import overlayStyles from '../home/overlays/overlay.styles';


const MenuModal = ({
                     buttonText,
                     children,
                     modalTitle,
                     disabled,
                     onPress,
                     overlayStyle,
                     showOK,
                     visible,
                   }) => {

  return (
    <Overlay
      animationType={'fade'}
      overlayStyle={[overlayStyles.overlayContainer, overlayStyle]}
      backdropStyle={overlayStyles.backdropStyles}
      isVisible={visible}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>{modalTitle}</Text>
      </View>
      <View style={overlayStyles.overlayContent}>
        {children}
      </View>
      <View style={overlayStyles.buttonContainer}>
        {showOK && (
          <Button
            title={buttonText || 'OK'}
            type={'clear'}
            titleStyle={disabled ? overlayStyles.disabledButtonText : overlayStyles.buttonText}
            disabled={disabled}
            onPress={onPress}
          />
        )}
      </View>
    </Overlay>
  );
};

export default MenuModal;
