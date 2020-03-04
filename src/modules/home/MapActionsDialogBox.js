import React from 'react';
import Dialog, {DialogButton, DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';
// import {Switch} from "react-native-switch";

import * as themes from '../../shared/styles.constants';
import styles from './dialog.styles';
import {useSelector} from 'react-redux';

const slideAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

const MapActionsDialog = props => {
  const isOnline = useSelector(state => state.home.isOnline);

  return (
  <Dialog
    width={0.3}
    dialogAnimation={slideAnimation}
    dialogStyle={styles.dialogBox}
    visible={props.visible}
    dialogTitle={
      <DialogTitle
        title='Map Actions'
        style={styles.dialogTitle}
        textStyle={
          {
            color: 'white',
            fontSize: themes.PRIMARY_TEXT_SIZE,
            fontWeight: 'bold',
          }
        }
      />}
    onTouchOutside={props.onTouchOutside}
  >
    <DialogContent>
      <DialogButton
        style={styles.dialogContent}
        text='Zoom to Extent of Spots'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('zoom')}
      />
      {isOnline ? <DialogButton
        style={styles.dialogContent}
        text='Save Map for Offline Use'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('saveMap')}
        disabled={props.disabled}
      /> : null}
      <DialogButton
        style={styles.dialogContent}
        text='Add Tag(s) to Spot(s)'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('addTag')}
      />
      <DialogButton
        style={styles.dialogContent}
        text='Lasso Spots for Stereonet'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('stereonet')}
      />
    </DialogContent>
  </Dialog>
);
};

export default MapActionsDialog;
