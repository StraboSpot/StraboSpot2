import React from 'react';
import Dialog, {DialogButton, DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {useSelector} from 'react-redux';

// Styles
import styles from './notebookPanel.styles';

// Constants
import {menuButtons} from '../../shared/app.constants';

const NotebookPanelMenu = (props) => {
  const isAllSpotsPanelVisible = useSelector(state => state.home.isAllSpotsPanelVisible);

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
          onPress={() => props.onPress(menuButtons.notebookMenu.COPY_FEATURE)}
        />
        <DialogButton
          style={styles.dialogContent}
          text='Delete this Spot'
          textStyle={styles.dialogText}
          onPress={() => props.onPress(menuButtons.notebookMenu.DELETE_SPOT)}
        />
        {isAllSpotsPanelVisible ?
          <DialogButton
            style={styles.dialogContent}
            text='Close All Spots Panel'
            textStyle={styles.dialogText}
            onPress={() => props.onPress(menuButtons.notebookMenu.TOGGLE_ALL_SPOTS_PANEL, 'close')}/> :
          <DialogButton
            style={styles.dialogContent}
            text='Open All Spots Panel'
            textStyle={styles.dialogText}
            onPress={() => props.onPress(menuButtons.notebookMenu.TOGGLE_ALL_SPOTS_PANEL, 'open')}
          />}
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
