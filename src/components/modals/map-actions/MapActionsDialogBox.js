import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Dialog, {DialogButton, DialogContent, DialogTitle} from "react-native-popup-dialog";
import {ScaleAnimation} from "react-native-popup-dialog/src";
// import {Switch} from "react-native-switch";

import * as themes from '../../../shared/styles.constants';

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
        onPress={() => props.onPress("zoom")}
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
      {/*<View style={styles.container}>*/}
        {/*<Text style={styles.textStyle}>Edit Mode</Text>*/}
        {/*<Switch*/}
          {/*style={{justifyContent: 'flex-end'}}*/}
          {/*circleSize={25}*/}
          {/*barHeight={20}*/}
          {/*circleBorderWidth={3}*/}
          {/*backgroundActive={'#407ad9'}*/}
          {/*backgroundInactive={'gray'}*/}
          {/*circleActiveColor={'#000000'}*/}
          {/*circleInActiveColor={'#000000'}*/}
          {/*changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete*/}
          {/*innerCircleStyle={{ alignItems: "center", justifyContent: "center" }}*/}
        {/*/>*/}
      {/*</View>*/}
    </DialogContent>
  </Dialog>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10
  },
  dialogBox: {
    position: 'absolute',
    bottom: 70,
    left: 100,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20
  },
  dialogTitle: {
    backgroundColor: themes.PRIMARY_HEADER_TEXT_COLOR,
  },
  dialogContent: {
    borderBottomWidth: 2
  },
  textStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: 'black',
    paddingRight: 45
  },
});

export default MapActionsDialog;
