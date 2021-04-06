import React from 'react';

import Dialog, {
  DialogButton,
  DialogContent,
  DialogFooter,
  DialogTitle,
  FadeAnimation,
} from 'react-native-popup-dialog';

import commonStyles from '../../shared/common.styles';
import * as ProjectActions from './project.constants';
import styles from './project.styles';

const UploadDialogBox = (props) => {
  return (
    <React.Fragment>
      <Dialog
        dialogStyle={commonStyles.dialogBox}
        width={275}
        visible={props.visible}
        dialogAnimation={new FadeAnimation({
          animationDuration: 200,
          useNativeDriver: true,
        })}
        // useNativeDriver={true}
        footer={
          <DialogFooter>
            <DialogButton
              text='CANCEL'
              onPress={props.cancel}
              style={styles.dialogButton}
              textStyle={[styles.dialogButtonText, {color: 'red'}]}
            />
            <DialogButton
              text={props.buttonText || 'OK'}
              onPress={() => props.onPress(ProjectActions.BACKUP_TO_SERVER)}
              style={[styles.dialogButton]}
              textStyle={props.disabled ? styles.dialogDisabledButtonText : styles.dialogButtonText}
              disabled={props.disabled}
            />
          </DialogFooter>
        }
        dialogTitle={
          <DialogTitle
            style={styles.dialogTitleContainer}
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
