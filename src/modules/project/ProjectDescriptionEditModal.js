import React from 'react';
import {Text, View} from 'react-native';
import Dialog, {
  DialogTitle,
  DialogButton,
  DialogContent,
  DialogFooter,
  SlideAnimation,
  FadeAnimation,
} from 'react-native-popup-dialog';
import styles from '../../shared/common.styles';

const DescriptionEditingModal = (props) => {

  return (
    <React.Fragment>
      <Dialog
        dialogStyle={styles.dialogBox}
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
        footer = {
          <DialogFooter>
            <DialogButton onPress={props.confirm} text={'Close'}/>
            {/*<DialogButton onPress={props.cancel} text={'Cancel'}/>*/}
          </DialogFooter>
        }
      >
        <DialogContent style={[styles.dialogContent, props.dialogContent]}>
          {props.children}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default DescriptionEditingModal;
