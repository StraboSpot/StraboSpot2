import React from 'react';

import Dialog, {DialogButton, DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';

// Styles
import styles from './dialog.styles';

const scaleAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

const MapSymbolsDialog = (props) => (
  <Dialog
    dialogAnimation={scaleAnimation}
    dialogStyle={styles.dialogBox}
    visible={props.visible}
    dialogTitle={
      <DialogTitle
        title='Map Symbols'
        style={styles.dialogTitle}
        textStyle={styles.dialogTitleText}
      />}
    onTouchOutside={props.onTouchOutside}
  >
    <DialogContent>
      <DialogButton
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
