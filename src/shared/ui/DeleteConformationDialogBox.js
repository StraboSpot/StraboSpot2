import React from 'react';

import Dialog, {
  DialogButton,
  DialogContent,
  DialogFooter,
  DialogTitle,
  FadeAnimation,
} from 'react-native-popup-dialog';

import styles from '../../shared/common.styles';

const deleteConformation = (props) => {
  return (
    <Dialog
      dialogStyle={[styles.dialogBox, {position: 'absolute', top: '25%'}]}
      width={300}
      visible={props.visible}
      dialogAnimation={new FadeAnimation({animationDuration: 300, useNativeDriver: true})}
      useNativeDriver={true}
      dialogTitle={
        <DialogTitle
          style={styles.dialogTitle}
          textStyle={styles.dialogTitleText}
          title={props.title}
        />
      }
      footer={
        <DialogFooter>
          <DialogButton text={'Delete'} onPress={props.delete}/>
          <DialogButton text={'Cancel'} onPress={props.cancel}/>
        </DialogFooter>
      }
    >
      <DialogContent style={styles.dialogContent}>
        {props.children}
      </DialogContent>

    </Dialog>
  );
};

export default deleteConformation;
