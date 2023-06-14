import React from 'react';
import {Alert, Text, View} from 'react-native';

import {Overlay, Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import homeStyles from '../../home/home.style';
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
    <Overlay
      overlayStyle={[homeStyles.dialogBox, styles.dialogBox]}
      isVisible={props.visible}
      onBackdropPress={props.onTouchOutside}
    >
      <View style={[homeStyles.dialogTitleContainer, styles.dialogTitle]}>
        <Text style={[homeStyles.dialogTitleText, styles.dialogTitleText]}>Spot Actions</Text>
      </View>
      <View>
        <Button
          title={'Copy this Spot'}
          titleStyle={styles.dialogText}
          type={'clear'}
          onPress={() => {
            useSpots.copySpot().catch(err => console.log('Error copying Spot!', err));
            dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
            props.closeNotebookPanelMenu();
          }}
        />
        <Button
          style={styles.dialogContent}
          title={'Zoom to this Spot'}
          titleStyle={styles.dialogText}
          type={'clear'}
          onPress={() => {
            props.zoomToSpot();
            props.closeNotebookPanelMenu();
          }}
        />
        <Button
          style={styles.dialogContent}
          title={'Delete this Spot'}
          titleStyle={styles.dialogText}
          type={'clear'}
          onPress={() => {
            deleteSelectedSpot();
            props.closeNotebookPanelMenu();
          }}
        />
        <Button
          style={styles.dialogContent}
          title={'Show Nesting'}
          titleStyle={styles.dialogText}
          type={'clear'}
          onPress={() => {
            dispatch(setNotebookPageVisible(PAGE_KEYS.NESTING));
            props.closeNotebookPanelMenu();
          }}
        />
        <Button
          style={styles.dialogContent}
          title={'Close Notebook'}
          titleStyle={styles.dialogText}
          type={'clear'}
          onPress={async () => {
            await props.closeNotebookPanelMenu();
            props.closeNotebookPanel();
          }}
        />
      </View>
    </Overlay>
  );
};

export default NotebookPanelMenu;
