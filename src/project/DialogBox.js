import React from 'react';
import Dialog, { DialogTitle, DialogContent, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import styles from "./Project.styles";

const DialogBox = (props) => {
  return (
    <React.Fragment>
      <Dialog
        dialogStyle={styles.dialogBox}
        width={275}
        visible={props.visible}
        dialogAnimation={new SlideAnimation({
          slideFrom: 'top',
        })}
        useNativeDriver={true}
        footer={
          <DialogFooter>
            <DialogButton
              text={'Backup Project to Device'}
              onPress={props.continue}
              style={styles.dialogButton}
              textStyle={styles.dialogButtonText}
            />
            {props.isOnline && <DialogButton
              text={'Backup Project to Server'}
              onPress={props.continue}
              style={styles.dialogButton}
              textStyle={styles.dialogButtonText}
            />}
            <DialogButton
              text={'Overwrite Project'}
              onPress={props.continue}
              style={styles.dialogButton}
              textStyle={styles.dialogButtonText}
            />
            <DialogButton
              text="CANCEL"
              onPress={props.cancel}
              style={styles.dialogButton}
              textStyle={[styles.dialogButtonText, {color: 'red'}]}
            />
          </DialogFooter>
        }
        dialogTitle={
          <DialogTitle
            style={styles.dialogTitle}
            textStyle={styles.dialogTitleText}
            title={props.dialogTitle}/>
        }
      >
        <DialogContent>
          {props.children}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default DialogBox ;
