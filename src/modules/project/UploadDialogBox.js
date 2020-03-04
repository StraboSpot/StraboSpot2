import React from 'react';
import Dialog, {
  DialogTitle,
  DialogContent,
  SlideAnimation,
  DialogFooter,
  DialogButton,
} from 'react-native-popup-dialog';
import * as ProjectActions from './project.constants';
import styles from './project.styles';

const UploadDialogBox = (props) => {
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
              text='CANCEL'
              onPress={props.cancel}
              style={styles.dialogButton}
              textStyle={[styles.dialogButtonText, {color: 'red'}]}
            />
            <DialogButton
              text={'OK'}
              onPress={() => props.onPress(ProjectActions.BACKUP_TO_SERVER)}
              style={[styles.dialogButton]}
              textStyle={styles.dialogButtonText}
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
        <DialogContent style={styles.dialogContent}>
          {props.children}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default UploadDialogBox;
