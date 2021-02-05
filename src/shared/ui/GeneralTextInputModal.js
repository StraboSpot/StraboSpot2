import React from 'react';
import {View} from 'react-native';

import {Input} from 'react-native-elements';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogButton,
  DialogFooter,
  FadeAnimation,
} from 'react-native-popup-dialog';

import styles from '../../shared/common.styles';

const TextInputModal = (props) => {
  return (
    <View>
      <Dialog
        dialogStyle={[styles.dialogBox, {position: 'absolute', top: '25%'}]}
        width={300}
        visible={props.visible}
        dialogAnimation={new FadeAnimation({
          animationDuration: 300,
          useNativeDriver: true,
        })}
        onTouchOutside={props.onTouchOutside}
        useNativeDriver={true}
        dialogTitle={
          <DialogTitle
            style={props.style}
            textStyle={styles.dialogTitleText}
            title={props.dialogTitle}/>
        }
        footer={
          <DialogFooter>
            <DialogButton text={'Save'} onPress={props.onPress}/>
            <DialogButton text={'Cancel'} onPress={props.close}/>
          </DialogFooter>
        }
      >
        <DialogContent style={[styles.dialogContent, props.dialogContent]}>
          <Input
            multiline={props.multiline}
            numberOfLines={5}
            value={props.value}
            returnKeyType={'done'}
            keyboardType={props.keyboardType}
            inputContainerStyle={{borderColor: 'transparent'}}
            inputStyle={[styles.textInput, props.textInputStyle]}
            onChangeText={props.onChangeText}
            placeholder={'Enter text here...'}
          />
          {props.children}
        </DialogContent>
      </Dialog>
    </View>
  );
};

export default TextInputModal;
