import React from 'react';
import {Platform, Text, View} from 'react-native';

import {Dialog, DialogButton, DialogContent, DialogFooter, SlideAnimation} from 'react-native-popup-dialog';

// import ProgressBar from 'react-native-progress/Bar';
import commonStyles from '../../common.styles';

const ProgressModal = (props) => {

  return (
    <Dialog
      visible={props.isProgressModalVisible}
      maxHeight={Platform.OS === 'ios' ? 400 : 275}
      dialogStyle={{...commonStyles.dialogBox, width: 300}}
      dialogAnimation={new SlideAnimation({
        slideFrom: 'top',
      })}
      dialogTitle={
        <View style={commonStyles.dialogTitleContainer}>
          <Text style={{fontSize: 25}}>{props.dialogTitle}</Text>
        </View>
      }
      footer={
        <View>
          {props.showButton && <DialogFooter>
            <DialogButton
              text={props.buttonText || 'OK'}
              onPress={props.onPressComplete}
              textStyle={commonStyles.dialogButtonText}
              disabled={props.disabled}
            />
          </DialogFooter>}
        </View>
      }
    >
      <DialogContent style={{...commonStyles.dialogContent}}>
        {props.children}
      </DialogContent>
      <DialogContent style={{height: 150, marginBottom: 20}}>
        {props.animation}
      </DialogContent>
    </Dialog>
  );
};

export default ProgressModal;
