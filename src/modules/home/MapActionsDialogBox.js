import React from 'react';
import {Platform} from 'react-native';

import Dialog, {DialogButton, DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {ScaleAnimation} from 'react-native-popup-dialog/src';
import {useSelector} from 'react-redux';

// Styles
import styles from './dialog.styles';

const slideAnimation = new ScaleAnimation({useNativeDriver: true});

const MapActionsDialog = (props) => {

  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const {isInternetReachable, isConnected} = useSelector(state => state.home.isOnline);
  const stratSection = useSelector(state => state.map.stratSection);

  return (
    <Dialog
      dialogAnimation={slideAnimation}
      dialogStyle={styles.dialogBox}
      visible={props.visible}
      dialogTitle={
        <DialogTitle
          title={'Map Actions'}
          style={styles.dialogTitle}
          textStyle={styles.dialogTitleText}
        />}
      onTouchOutside={props.onTouchOutside}
    >
      <DialogContent>
        <DialogButton
          text={'Zoom to Extent of Spots'}
          textStyle={styles.dialogText}
          onPress={() => props.onPress('zoom')}
        />
        {/*<DialogButton*/}
        {/*  text='Zoom to Offline Map'*/}
        {/*  textStyle={styles.dialogText}*/}
        {/*  onPress={() => props.onPress('zoomToOfflineMap')}*/}
        {/*/>*/}
        {((isInternetReachable && isConnected) || (!isInternetReachable && isConnected && currentBasemap?.source)) && (
          <DialogButton
            style={styles.dialogContent}
            text={'Save Map for Offline Use'}
            textStyle={styles.dialogText}
            onPress={() => props.onPress('saveMap')}
          />
        )}
        <DialogButton
          style={styles.dialogContent}
          text={'Add Tag(s) to Spot(s)'}
          textStyle={styles.dialogText}
          onPress={() => props.onPress('addTag')}
        />
        {Platform.OS === 'ios' && (
          <DialogButton
            style={styles.dialogContent}
            text={'Lasso Spots for Stereonet'}
            textStyle={styles.dialogText}
            onPress={() => props.onPress('stereonet')}
          />
        )}
        <DialogButton
          style={styles.dialogContent}
          text={'Measure Distance'}
          textStyle={styles.dialogText}
          onPress={() => props.onPress('mapMeasurement')}
        />
        {stratSection && (
          <DialogButton
            style={styles.dialogContent}
            text={'Strat Section Settings'}
            textStyle={styles.dialogText}
            onPress={() => props.onPress('stratSection')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MapActionsDialog;
