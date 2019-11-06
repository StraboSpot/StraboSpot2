import React from 'react';
import {Text, View} from 'react-native';
import Dialog, { DialogTitle, DialogContent, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import styles from "./Project.styles";
import {Button} from "react-native-elements";

const DialogBox = (props) => {
  return (
    <React.Fragment>
      <Dialog
        dialogStyle={styles.dialogBox}
        width={275}
        visible={props.visible}
        dialogAnimation={new SlideAnimation({
          slideFrom: 'top',
        })}
        footer={
          <View>
            <Button
                title={`Backup "${props.projectName}" \nto Device`}
                titleStyle={styles.dialogButtonText}
                type={'clear'}
                onPress={props.continue}
                buttonStyle={styles.dialogButton}
            />
            <Button
              title={`Backup "${props.projectName}" \nto Server`}
              titleStyle={styles.dialogButtonText}
              type={'clear'}
              onPress={props.continue}
              buttonStyle={styles.dialogButton}
            />
            <Button
              title={`Overwrite \n"${props.projectName}"`}
              titleStyle={styles.dialogButtonText}
              type={'clear'}
              onPress={props.continue}
              buttonStyle={styles.dialogButton}
            />
            <Button
              title={`CANCEL`}
              titleStyle={{color: 'red'}}
              type={'clear'}
              onPress={props.continue}
              buttonStyle={styles.dialogButton}
            />
            {/*<DialogButton*/}
            {/*  text={`Backup ${props.projectName} to Device`}*/}
            {/*  onPress={props.continue}*/}
            {/*  style={styles.dialogButton}*/}
            {/*  textStyle={styles.dialogButtonText}*/}
            {/*/>*/}
            {/*<DialogButton*/}
            {/*  text={`Backup ${props.projectName} to Server`}*/}
            {/*  onPress={props.continue}*/}
            {/*  style={styles.dialogButton}*/}
            {/*  textStyle={styles.dialogButtonText}*/}
            {/*/>*/}
            {/*<DialogButton*/}
            {/*  text={`Overwrite ${props.projectName}`}*/}
            {/*  onPress={props.continue}*/}
            {/*  style={styles.dialogButton}*/}
            {/*  textStyle={styles.dialogButtonText}*/}
            {/*/>*/}
            {/*<DialogButton*/}
            {/*  text="CANCEL"*/}
            {/*  onPress={props.cancel}*/}
            {/*  style={styles.dialogButton}*/}
            {/*  textStyle={[styles.dialogButtonText, {color: 'red'}]}*/}
            {/*/>*/}
          </View>
        }
        dialogTitle={
          <DialogTitle
            style={styles.dialogTitle}
            textStyle={styles.dialogTitleText}
            title={props.dialogTitle}/>
        }
      >
        <DialogContent>
          {props.children}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default DialogBox ;
