import React from 'react';
import {Alert, Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import overlayStyles from '../../home/overlay.styles';
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
      overlayStyle={[overlayStyles.overlayContainer, styles.dialogBoxPosition]}
      isVisible={props.visible}
      onBackdropPress={props.onTouchOutside}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>Spot Actions</Text>
      </View>
      <View>
        <Button
          title={'Copy this Spot'}
          titleStyle={overlayStyles.buttonTitle}
          type={'clear'}
          onPress={() => {
            useSpots.copySpot().catch(err => console.log('Error copying Spot!', err));
            dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
            props.closeNotebookPanelMenu();
          }}
        />
        <Button
          containerStyle={styles.threeDotMenuButtonContainer}
          title={'Zoom to this Spot'}
          titleStyle={overlayStyles.buttonTitle}
          type={'clear'}
          onPress={() => {
            props.zoomToSpot();
            props.closeNotebookPanelMenu();
          }}
        />
        <Button
          containerStyle={styles.threeDotMenuButtonContainer}
          title={'Delete this Spot'}
          titleStyle={overlayStyles.buttonTitle}
          type={'clear'}
          onPress={() => {
            deleteSelectedSpot();
            props.closeNotebookPanelMenu();
          }}
        />
        <Button
          containerStyle={styles.threeDotMenuButtonContainer}
          title={'Show Nesting'}
          titleStyle={overlayStyles.buttonTitle}
          type={'clear'}
          onPress={() => {
            dispatch(setNotebookPageVisible(PAGE_KEYS.NESTING));
            props.closeNotebookPanelMenu();
          }}
        />
        <Button
          containerStyle={styles.threeDotMenuButtonContainer}
          title={'Close Notebook'}
          titleStyle={overlayStyles.buttonTitle}
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
