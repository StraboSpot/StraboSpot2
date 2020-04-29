import React from 'react';
import {TextInput,KeyboardAvoidingView, View} from 'react-native';
import {Input} from 'react-native-elements';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogButton,
  DialogFooter,
  SlideAnimation,
  FadeAnimation,
} from 'react-native-popup-dialog';
import styles from '../../shared/common.styles';

const TexInputModal = (props) => {
  return (
    <View style={{}}>
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
            value={props.value}
            maxLength={25}
            inputContainerStyle={{ borderColor: 'transparent'}}
            inputStyle={{backgroundColor: 'white', height: 50, width: 200, paddingLeft: 20}}
            onChangeText={props.onChangeText}
            placeholder={'Enter text here...'}
          />
          {props.children}
        </DialogContent>
      </Dialog>
    </View>
  );
};

export default TexInputModal;
