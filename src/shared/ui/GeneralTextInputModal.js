import React from 'react';
import {Text, View} from 'react-native';

import {Button, Input, Overlay} from 'react-native-elements';

import overlayStyles from '../../modules/home/overlays/overlay.styles';
import * as themes from '../styles.constants';

const TextInputModal = ({
                          autoCapitalize,
                          buttonText,
                          children,
                          closeModal,
                          dialogTitle,
                          errorMessage,
                          keyboardType,
                          multiline,
                          onChangeText,
                          onPress,
                          onSubmitEditing,
                          onTouchOutside,
                          overlayButtonText,
                          overlayTitleText,
                          placeholder,
                          renderErrorMessage,
                          style,
                          textAboveInput,
                          value,
                          visible,
                        }) => {
  return (
    <Overlay
      animationType={'fade'}
      isVisible={visible}
      overlayStyle={[overlayStyles.overlayContainer]}
      onBackdropPress={onTouchOutside}
      backdropStyle={{backgroundColor: 'transparent'}}
    >
      <View style={[overlayStyles.titleContainer, style]}>
        <Text style={[overlayStyles.titleText, overlayTitleText]}>{dialogTitle}</Text>
      </View>
      <View>
        {textAboveInput}
        <Input
          autoCapitalize={autoCapitalize || 'none'}
          multiline={multiline}
          value={value || ''}
          enterKeyHint={'done'}
          keyboardType={keyboardType}
          inputContainerStyle={overlayStyles.inputContainer}
          onChangeText={onChangeText}
          placeholder={placeholder || 'Enter text here...'}
          placeholderTextColor={themes.MEDIUMGREY}
          errorMessage={errorMessage}
          renderErrorMessage={renderErrorMessage}
          onSubmitEditing={onSubmitEditing}
          style={[{textAlignVertical: 'top'}, multiline ? {height: 100} : {height: 40}]}
        />
        {children}
      </View>
      <View style={overlayStyles.buttonContainer}>
        <Button
          title={buttonText || 'Save'}
          type={'clear'}
          titleStyle={[overlayStyles.buttonText, overlayButtonText]}
          onPress={onPress}
        />
        <Button
          title={'Cancel'}
          type={'clear'}
          titleStyle={overlayStyles.buttonText}
          onPress={closeModal}
        />
      </View>
    </Overlay>
  );
};

export default TextInputModal;
