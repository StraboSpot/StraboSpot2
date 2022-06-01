import React from 'react';
import {Alert} from 'react-native';

import Dialog, {DialogButton, DialogContent, DialogTitle} from 'react-native-popup-dialog';
import {useDispatch, useSelector} from 'react-redux';

import useStratSectionHook from '../../maps/strat-section/useStratSection';
import {PAGE_KEYS} from '../../page/page.constants';
import useSpotsHook from '../../spots/useSpots';
import {setNotebookPageVisible} from '../notebook.slice';
import styles from '../notebookPanel.styles';

const NotebookPanelMenu = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [useSpots] = useSpotsHook();
  const useStratSection = useStratSectionHook();

  const continueDeleteSelectedSpot = () => {
    if (useSpots.isStratInterval(spot)) useStratSection.deleteInterval(spot);
    else useSpots.deleteSpot(spot.properties.id);
  };

  const deleteSelectedSpot = () => {
    const errorMsg = useSpots.checkIsSafeDelete(spot);
    if (errorMsg) Alert.alert('Unable to Delete Spot', errorMsg);
    else {
      Alert.alert(
        'Delete Spot?',
        'Are you sure you want to delete Spot: ' + spot.properties.name,
        [{
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        }, {
          text: 'Delete',
          onPress: continueDeleteSelectedSpot,
        }],
      );
    }
  };

  return (
    <Dialog
      dialogStyle={styles.dialogBox}
      visible={props.visible}
      onTouchOutside={props.onTouchOutside}
      dialogTitle={
        <DialogTitle
          title={'Spot Actions'}
          style={styles.dialogTitle}
          textStyle={styles.dialogTitleText}
        />
      }
    >
      <DialogContent>
        <DialogButton
          text={'Copy this Spot'}
          textStyle={styles.dialogText}
          onPress={() => {
            useSpots.copySpot().catch(err => console.log('Error copying Spot!', err));
            dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
            props.closeNotebookPanelMenu();
          }}
        />
        <DialogButton
          style={styles.dialogContent}
          text={'Zoom to this Spot'}
          textStyle={styles.dialogText}
          onPress={() => {
            props.zoomToSpot();
            props.closeNotebookPanelMenu();
          }}
        />
        <DialogButton
          style={styles.dialogContent}
          text={'Delete this Spot'}
          textStyle={styles.dialogText}
          onPress={() => {
            deleteSelectedSpot();
            props.closeNotebookPanelMenu();
          }}
        />
        <DialogButton
          style={styles.dialogContent}
          text={'Show Nesting'}
          textStyle={styles.dialogText}
          onPress={() => {
            dispatch(setNotebookPageVisible(PAGE_KEYS.NESTING));
            props.closeNotebookPanelMenu();
          }}
        />
        <DialogButton
          style={styles.dialogContent}
          text={'Close Notebook'}
          textStyle={styles.dialogText}
          onPress={async () => {
            await props.closeNotebookPanelMenu();
            props.closeNotebookPanel();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NotebookPanelMenu;
