import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Dialog, {DialogButton, DialogContent, DialogTitle} from "react-native-popup-dialog";
import {ScaleAnimation} from "react-native-popup-dialog/src";
// import {Switch} from "react-native-switch";

import * as themes from '../../../shared/styles.constants';
import styles from '../Dialog.styles';

const slideAnimation = new ScaleAnimation({
  useNativeDriver: true
});

const MapActionsDialog = props => (
  <Dialog
    width={.3}
    dialogAnimation={slideAnimation}
    dialogStyle={styles.dialogBox}
    visible={props.visible}
    dialogTitle={
      <DialogTitle
        title="Map Actions"
        style={styles.dialogTitle}
        textStyle={
          {
            color: "white",
            fontSize: themes.PRIMARY_TEXT_SIZE,
            fontWeight: "bold"
          }
        }
      />}
    onTouchOutside={props.onTouchOutside}
  >
    <DialogContent>
      <DialogButton
        style={styles.dialogContent}
        text="Zoom to Extent of Spots"
        textStyle={styles.dialogText}
        onPress={() => props.onPress("zoom")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Save Map for Offline Use"
        textStyle={styles.dialogText}
        onPress={() => props.onPress("saveMap")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Add Tag(s) to Spot(s)"
        textStyle={styles.dialogText}
        onPress={() => props.onPress("addTag")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Lasso Spots for Stereonet"
        textStyle={styles.dialogText}
        onPress={() => props.onPress("stereonet")}
      />
    </DialogContent>
  </Dialog>
);


export default MapActionsDialog;
