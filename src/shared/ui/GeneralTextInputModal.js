import React from 'react';
import {Text, View} from 'react-native';

import {Button, Input, Overlay} from 'react-native-elements';

import overlayStyles from '../../modules/home/overlay.styles';
import * as themes from '../styles.constants';

const TextInputModal = (props) => {
  return (
    <Overlay
      animationType={'fade'}
      isVisible={props.visible}
      overlayStyle={[overlayStyles.overlayContainer]}
      onBackdropPress={props.onTouchOutside}
      backdropStyle={{backgroundColor: 'transparent'}}
    >
      <View style={[overlayStyles.titleContainer, props.style]}>
        <Text style={[overlayStyles.titleText, props.overlayTitleText]}>{props.dialogTitle}</Text>
      </View>
      <View>
        {props.textAboveInput}
        <Input
          autoCapitalize={props.autoCapitalize || 'none'}
          multiline={props.multiline}
          value={props.value || ''}
          enterKeyHint={'done'}
          keyboardType={props.keyboardType}
          inputContainerStyle={overlayStyles.inputContainer}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder || 'Enter text here...'}
          placeholderTextColor={themes.MEDIUMGREY}
          errorMessage={props.errorMessage}
          renderErrorMessage={props.renderErrorMessage}
          onSubmitEditing={props.onSubmitEditing}
          style={[{textAlignVertical: 'top'}, props.multiline ? {height: 100} : {height: 40}]}
        />
        {props.children}
      </View>
      <View style={overlayStyles.buttonContainer}>
        <Button
          title={props.buttonText || 'Save'}
          type={'clear'}
          titleStyle={[overlayStyles.buttonText, props.overlayButtonText]}
          onPress={props.onPress}
        />
        <Button
          title={'Cancel'}
          type={'clear'}
          titleStyle={overlayStyles.buttonText}
          onPress={props.close}
        />
      </View>
    </Overlay>
  );
};

export default TextInputModal;
