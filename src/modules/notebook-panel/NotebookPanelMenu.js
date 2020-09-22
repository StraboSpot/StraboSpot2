import React from 'react';

import Dialog, {DialogButton, DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {useSelector} from 'react-redux';

import {menuButtons} from '../../shared/app.constants';
import styles from './notebookPanel.styles';

const NotebookPanelMenu = (props) => {
  const isAllSpotsPanelVisible = useSelector(state => state.home.isAllSpotsPanelVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  return (
    <Dialog
      dialogStyle={styles.dialogBox}
      visible={props.visible}
      onTouchOutside={props.onTouchOutside}
      dialogTitle={
        <DialogTitle
          title='Spot Actions'
          style={styles.dialogTitle}
          textStyle={styles.dialogTitleText}
        />}
    >
      <DialogContent>
        <DialogButton
          text='Copy this Spot'
          textStyle={styles.dialogText}
          onPress={() => props.onPress(menuButtons.notebookMenu.COPY_SPOT)}
        />
        <DialogButton
          style={styles.dialogContent}
          text='Zoom to this Spot'
          textStyle={styles.dialogText}
          onPress={() => props.onPress(menuButtons.notebookMenu.ZOOM_TO_SPOT)}
        />
        <DialogButton
          style={styles.dialogContent}
          text='Delete this Spot'
          textStyle={styles.dialogText}
          onPress={() => props.onPress(menuButtons.notebookMenu.DELETE_SPOT)}
        />
        {isAllSpotsPanelVisible
          ? (
            <DialogButton
              style={styles.dialogContent}
              text='Close All Spots Panel'
              textStyle={styles.dialogText}
              onPress={() => props.onPress(menuButtons.notebookMenu.TOGGLE_ALL_SPOTS_PANEL, 'close')}
            />
          )
          : (
            <DialogButton
              style={styles.dialogContent}
              text='Open All Spots Panel'
              textStyle={styles.dialogText}
              onPress={() => props.onPress(menuButtons.notebookMenu.TOGGLE_ALL_SPOTS_PANEL, 'open')}
            />
          )
        }
        <DialogButton
          style={styles.dialogContent}
          text='Show Nesting'
          textStyle={styles.dialogText}
          onPress={() => props.onPress(menuButtons.notebookMenu.SHOW_NESTING)}
        />
        <DialogButton
          style={styles.dialogContent}
          text='Close Notebook'
          textStyle={styles.dialogText}
          onPress={() => props.onPress(menuButtons.notebookMenu.CLOSE_NOTEBOOK)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NotebookPanelMenu;
