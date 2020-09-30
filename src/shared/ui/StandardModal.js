import React from 'react';

import Dialog, {
  DialogButton,
  DialogFooter,
  DialogTitle,
  DialogContent,
  FadeAnimation,
} from 'react-native-popup-dialog';

import commonStyles from '../common.styles';
import styles from './../../modules/project/project.styles';

const StandardModal = (props) => {
  return (
    <React.Fragment>
      <Dialog
        dialogStyle={commonStyles.dialogBox}
        width={props.width || 275}
        visible={props.visible}
        onTouchOutside={props.onTouchOutside}
        dialogAnimation={new FadeAnimation({
          animationDuration: 200,
          useNativeDriver: true,
        })}
        useNativeDriver={true}
        dialogTitle={
          <DialogTitle
            style={props.dialogTitleStyle}
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

export default StandardModal;
