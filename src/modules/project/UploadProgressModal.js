import React from 'react';
import {Platform, Text, View} from 'react-native';

import {Dialog, DialogButton, DialogContent, DialogFooter, SlideAnimation} from 'react-native-popup-dialog';

// import ProgressBar from 'react-native-progress/Bar';
import commonStyles from '../../shared/common.styles';
import styles from '../maps/offline-maps/offlineMaps.styles';

const UploadProgressModal = (props) => {

  return (
    <Dialog
      visible={props.upload}
      onBackdropPress={props.closeProgressModal}
      maxHeight={Platform.OS === 'ios' ? 400 : 275}
      dialogStyle={{...commonStyles.dialogBox, width: 300}}
      dialogAnimation={new SlideAnimation({
        slideFrom: 'top',
      })}
      dialogTitle={
        <View style={styles.dialogTitleContainer}>
          <View style={styles.dialogTitle}>
            <Text style={{fontSize: 25}}>UPLOAD</Text>
          </View>
        </View>
      }
      footer={
        <View>
          {props.showButton && <DialogFooter>
            <DialogButton
              text={props.buttonText || 'OK'}
              onPress={props.onPressComplete}
              style={[styles.dialogButton]}
              textStyle={props.disabled ? styles.dialogDisabledButtonText : styles.dialogButtonText}
              disabled={props.disabled}
            />
          </DialogFooter>}
        </View>
      }
    >
      <DialogContent style={commonStyles.dialogContent}>
        {props.children}
      </DialogContent>
    </Dialog>
  );
};

export default UploadProgressModal;
