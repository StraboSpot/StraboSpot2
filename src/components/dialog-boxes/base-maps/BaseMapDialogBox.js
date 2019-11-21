import React from 'react';
import Dialog, {DialogButton, DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';

import * as themes from '../../../shared/styles.constants';
import styles from '../Dialog.styles';

const slideAnimation = new ScaleAnimation({
  useNativeDriver: true,
});

const BaseMapDialog = props => (
  <Dialog
    width={0.3}
    dialogAnimation={slideAnimation}
    dialogStyle={styles.dialogBox}
    visible={props.visible}
    dialogTitle={
      <DialogTitle
        title='Base Maps'
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
        text='Mapbox Satellite'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('mapboxSatellite')}
      />
      <DialogButton
        style={styles.dialogContent}
        text='Mapbox Topo'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('mapboxOutdoors')}
      />
      <DialogButton
        style={styles.dialogContent}
        text='OSM Streets'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('osm')}
      />
      <DialogButton
        style={styles.dialogContent}
        text='Geology from Macrostrat'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('macrostrat')}
      />
      <DialogButton
        style={styles.dialogContent}
        text='Geology + Roads (Custom)'
        textStyle={styles.dialogText}
        onPress={() => props.onPress('custom')}
      />
      {/*<DialogButton*/}
      {/*style={styles.dialogContent}*/}
      {/*text="Geologic Map"*/}
      {/*/>*/}
      {/*<DialogButton*/}
      {/*style={styles.dialogContent}*/}
      {/*text="Roads"*/}
      {/*/>*/}
    </DialogContent>
  </Dialog>
);

export default BaseMapDialog;
