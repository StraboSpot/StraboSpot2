import React from 'react';
import {Text, View} from 'react-native';
import Dialog, {
  DialogTitle,
  DialogContent,
  SlideAnimation,
  DialogFooter,
  DialogButton,
} from 'react-native-popup-dialog';
import styles from '../../shared/common.styles';
import * as ProjectActions from '../../project/Project.constants';

const StatusDialogBox = (props) => {
  return (
    <React.Fragment>
      <Dialog
        dialogStyle={styles.dialogBox}
        width={275}
        visible={props.visible}
        dialogAnimation={new SlideAnimation({
          slideFrom: 'top',
        })}
        onTouchOutside={props.onTouchOutside}
        useNativeDriver={true}
        // footer={
        //   <DialogFooter>
        //     <DialogButton
        //       align={'center'}
        //       text={props.buttonText}
        //       onPress={props.cancel}
        //       style={styles.dialogButton}
        //       textStyle={styles.dialogButtonText}
        //       disabled={props.disabled}
        //     />
        //   </DialogFooter>
        // }
        dialogTitle={
          <DialogTitle
            style={props.style}
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

export default StatusDialogBox;
