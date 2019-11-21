import React from 'react';
import {Text, View} from 'react-native';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  SlideAnimation,
  DialogFooter,
  DialogButton,
} from 'react-native-popup-dialog';
import styles from './Styles';

const initialProjectLoadModal = (props) => {
  return (
    <React.Fragment>
      <Dialog
        dialogStyle={styles.dialogBox}
        containerStyle={{flexDirection: 'column'}}
        width={275}
        visible={props.visible}
        dialogAnimation={new SlideAnimation({
          slideFrom: 'top',
        })}
        useNativeDriver={true}
        dialogTitle={
          <DialogTitle
            title={'Welcome to Strabo Spot'}
            style={styles.dialogTitle}
            textStyle={styles.dialogTitleText}
          />
        }
        footer={
          <DialogFooter style={styles.dialogFooter}>
            <DialogButton
              text={'Create a New Project'}
              onPress={() => props.onPress('startProject')}
              style={styles.dialogButton}
              textStyle={styles.dialogButtonText}
            />
            <DialogButton
              text={'Select Existing Project from Server'}
              onPress={() => props.onPress('loadProject')}
              style={styles.dialogButton}
              textStyle={styles.dialogButtonText}
            />
          </DialogFooter>
        }
      >
        <DialogContent>
          {/*{props.children}*/}
          <Text style={{textAlign: 'center'}}>Please make a selection to continue...</Text>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default initialProjectLoadModal;
