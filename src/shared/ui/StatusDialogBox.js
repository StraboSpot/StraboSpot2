import React from 'react';
import Dialog, {
  DialogTitle,
  DialogContent,
  SlideAnimation,
  FadeAnimation,
} from 'react-native-popup-dialog';
import styles from '../../shared/common.styles';

const StatusDialogBox = (props) => {
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
      >
        <DialogContent style={[styles.dialogContent, props.dialogContent]}>
          {props.children}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default StatusDialogBox;
