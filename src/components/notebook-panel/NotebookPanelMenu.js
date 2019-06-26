import React from 'react';
import {StyleSheet, Switch, View} from 'react-native';
import Dialog, {DialogButton, DialogContent, DialogTitle} from "react-native-popup-dialog";
import {ScaleAnimation, SlideAnimation} from "react-native-popup-dialog/src";

const slideAnimation = new SlideAnimation({
  useNativeDriver: true,
  slideFrom: 'top',
  toValue: 0
});

const NotebookPanelMenu = props => (
  <Dialog
    width={.15}
    dialogStyle={styles.dialogBox}
    visible={props.visible}
    onTouchOutside={props.onTouchOutside}
  >
    <DialogContent>
      <DialogButton
        style={styles.dialogContent}
        text="Copy this feature"
        textStyle={{fontSize: 12}}
        onPress={() => props.onPress('copyFeature')}
      />
      <DialogButton
      style={styles.dialogContent}
      text="Delete this Feature"
      textStyle={{fontSize: 12}}
      onPress={() => props.onPress('deleteFeature')}
    />
      <DialogButton
        style={styles.dialogContent}
        text="Close Notebook"
        textStyle={{fontSize: 12}}
        onPress={() => props.onPress('closeNotebook')}
      />
    </DialogContent>
  </Dialog>
);

const styles = StyleSheet.create({
  dialogBox: {
    position: 'absolute',
    top: 25,
    right: 25,
    backgroundColor: "#eee",
    borderRadius: 20,
    zIndex: 10
  },
  dialogTitle: {
    backgroundColor: "#474242",
  },
  dialogContent: {
    borderBottomWidth: 1
  }
});

export default NotebookPanelMenu;
