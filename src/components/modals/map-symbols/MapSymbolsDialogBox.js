import React from 'react';
import {StyleSheet} from 'react-native';
import Dialog, {DialogButton, DialogContent, DialogTitle} from "react-native-popup-dialog";
import buttonWithBackground from "../../../ui/ButtonWithBackground";
import {FadeAnimation, ScaleAnimation, SlideAnimation} from "react-native-popup-dialog/src";

const scaleAnimation = new ScaleAnimation({
  useNativeDriver: true
});

const MapSymbolsDialog = props => (
  <Dialog
    dialogAnimation={scaleAnimation}
    dialogStyle={styles.dialogBox}
    visible={props.visible}
    dialogTitle={
      <DialogTitle
        title="Map Symbols"
        style={styles.dialogTitle}
        textStyle={
          {
            color: "white",
            fontSize: 18,
            fontWeight: "bold"
          }
        }
      />}
    onTouchOutside={props.onTouchOutside}
  >
    <DialogContent>
      <DialogButton
        style={styles.dialogContent}
        text="Foliations"
        onPress={() => props.onPress("foliations")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Bedding"
        onPress={() => props.onPress("bedding")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Faults"
        onPress={() => props.onPress("faults")}
      />
      <DialogButton
      style={styles.dialogContent}
      text="Fold Hinges"
      onPress={() => props.onPress("fold-hinges")}
    />
      <DialogButton
        style={styles.dialogContent}
        text="Fractures"
        onPress={() => props.onPress("fractures")}
      />
    </DialogContent>
  </Dialog>
);

const styles = StyleSheet.create({
  dialogBox: {
    position: 'absolute',
    bottom: 70,
    left: 100,
    backgroundColor: "#eee",
    borderRadius: 20
  },
  dialogTitle: {
    backgroundColor: "#474242",
  },
  dialogContent: {
    borderBottomWidth: 2
  }
});

export default MapSymbolsDialog;