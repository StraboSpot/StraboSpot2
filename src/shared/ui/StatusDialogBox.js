import React, {useRef} from 'react';
import {ScrollView} from 'react-native';

import Dialog, {DialogContent, DialogTitle, FadeAnimation} from 'react-native-popup-dialog';

import styles from '../../shared/common.styles';

const StatusDialogBox = (props) => {
  const scrollView = useRef();

  return (
    <React.Fragment>
      <Dialog
        dialogStyle={styles.dialogBox}
        width={300}
        visible={props.visible}
        dialogAnimation={
          new FadeAnimation({
            animationDuration: 300,
            useNativeDriver: true,
          })
        }
        onTouchOutside={props.onTouchOutside}
        useNativeDriver={true}
        dialogTitle={
          <DialogTitle
            style={props.style}
            textStyle={styles.dialogTitleText}
            title={props.dialogTitle}
          />
        }>
        <ScrollView
          ref={scrollView}
          onContentSizeChange={() =>
            scrollView.current.scrollToEnd({animated: true})
          }>
          <DialogContent style={[styles.dialogContent, props.dialogContent]}>
            {props.children}
          </DialogContent>
        </ScrollView>
      </Dialog>
    </React.Fragment>
  );
};

export default StatusDialogBox;
