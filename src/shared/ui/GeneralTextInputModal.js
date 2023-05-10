import React from 'react';
import {Text, View} from 'react-native';

import {Button, Input, Overlay} from 'react-native-elements';

import homeStyles from '../../modules/home/home.style';
import styles from '../../shared/common.styles';

const TextInputModal = (props) => {
  return (
    <Overlay
      animationType={'fade'}
      isVisible={props.visible}
      overlayStyle={[homeStyles.dialogBox, styles.dialogBox, {top: props.topPosition || '10%'}]}
      onBackdropPress={props.onTouchOutside}
    >
      <View style={[homeStyles.dialogTitleContainer, props.style]}>
        <Text style={[homeStyles.dialogTitleText, styles.dialogTitleText]}>{props.dialogTitle}</Text>
      </View>
      <View style={[styles.dialogContent, props.dialogContent]}>
        {props.textAboveInput}
        <Input
          autoCapitalize={props.autoCapitalize || 'none'}
          multiline={props.multiline}
          numberOfLines={5}
          value={props.value}
          returnKeyType={'done'}
          keyboardType={props.keyboardType}
          inputContainerStyle={{borderColor: 'transparent'}}
          inputStyle={[styles.textInput, props.textInputStyle]}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder || 'Enter text here...'}
          errorMessage={props.errorMessage}
          renderErrorMessage={props.renderErrorMessage}
          onSubmitEditing={props.onSubmitEditing}
        />
        {props.children}
      </View>
      <Button
        title={props.buttonText || 'Save'}
        titleStyle={props.buttonTextStyle}
        onPress={props.onPress}
      />
      <Button
        title={'Cancel'}
        onPress={props.close}
      />
    </Overlay>
  );
};

export default TextInputModal;
