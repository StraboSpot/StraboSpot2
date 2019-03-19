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
    // dialogAnimation={slideAnimation}
    dialogStyle={styles.dialogBox}
    visible={props.visible}
    // dialogTitle={
    //   <DialogTitle
    //     title="Menu"
    //     style={styles.dialogTitle}
    //     textStyle={
    //       {
    //         color: "white",
    //         fontSize: 18,
    //         fontWeight: "bold"
    //       }
    //     }
    //   />}
    onTouchOutside={props.onTouchOutside}
  >
    <DialogContent>
      <DialogButton
        style={styles.dialogContent}
        text="Copy this Spot"
        textStyle={{fontSize: 12}}
        onPress={() => props.onPress('copySpot')}
      /><DialogButton
      style={styles.dialogContent}
      text="Delete this Spot"
      textStyle={{fontSize: 12}}
      onPress={() => props.onPress('deleteSpot')}
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
