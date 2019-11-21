import React from 'react';
import {StyleSheet} from 'react-native';
import Dialog, {DialogButton, DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';

// Styles
import * as themes from '../../../shared/styles.constants';
import styles from '../Dialog.styles';

const scaleAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

const MapSymbolsDialog = props => (
  <Dialog
    width={0.3}
    dialogAnimation={scaleAnimation}
    dialogStyle={styles.dialogBox}
    visible={props.visible}
    dialogTitle={
      <DialogTitle
        title='Map Symbols'
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
        text='Foliations'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('foliations')}
      />
      <DialogButton
        style={styles.dialogContent}
        text='Bedding'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('bedding')}
      />
      <DialogButton
        style={styles.dialogContent}
        text='Faults'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('faults')}
      />
      <DialogButton
        style={styles.dialogContent}
        text='Fold Hinges'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('fold-hinges')}
      />
      <DialogButton
        style={styles.dialogContent}
        text='Fractures'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('fractures')}
      />
    </DialogContent>
  </Dialog>
);

export default MapSymbolsDialog;
