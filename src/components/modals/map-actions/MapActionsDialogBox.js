import React from 'react';
import {StyleSheet} from 'react-native';
import Dialog, {DialogButton, DialogContent, DialogTitle} from "react-native-popup-dialog";
import buttonWithBackground from "../../../ui/ButtonWithBackground";
import {FadeAnimation, ScaleAnimation, SlideAnimation} from "react-native-popup-dialog/src";

clickHandler = (name) => {
  switch (name){
    case name:
      console.log(`${name}`, " was clicked");
      break;

  }
};

const slideAnimation = new ScaleAnimation({
  useNativeDriver: true
});

const MapActionsDialog = props => (
  <Dialog
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
        text="Zoom to Extent of Spots"
        onPress={this.clickHandler.bind(this,"zoom")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Save Map for Offline Use"
        onPress={() => props.onPress("saveMap")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Add Tag(s) to Spot(s)"
        onPress={() => props.onPress("addTag")}

      />
      <DialogButton
        style={styles.dialogContent}
        text="Lasso Spots for Stereonet"
        onPress={() => props.onPress("stereonet")}

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

export default MapActionsDialog;