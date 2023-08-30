import React from 'react';
import {Alert, FlatList, Text, View} from 'react-native';

import {ListItem, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
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

  const actions = [
    {key: 'copy', title: 'Copy this Spot'},
    {key: 'zoom', title: 'Zoom to this Spot'},
    {key: 'delete', title: 'Delete this Spot'},
    {key: 'nesting', title: 'Show Nesting'},
    {key: 'close', title: 'Close Notebook'},
  ];

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

  const onPress = (key) => {
    if (key === 'copy') {
      useSpots.copySpot().catch(err => console.log('Error copying Spot!', err));
      dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
    }
    else if (key === 'zoom') props.zoomToSpot();
    else if (key === 'delete') deleteSelectedSpot();
    else if (key === 'nesting') dispatch(setNotebookPageVisible(PAGE_KEYS.NESTING));
    else props.closeNotebookPanel();
    props.closeNotebookPanelMenu();
  };

  const renderActionItem = (item) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={item.key}
        onPress={() => onPress(item.key)}
      >
        <ListItem.Title style={commonStyles.listItemTitle}>{item.title}</ListItem.Title>
      </ListItem>
    );
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
        <FlatList
          key={'notebookActions'}
          data={actions}
          contentContainerStyle={{alignItems: 'center'}}
          renderItem={({item}) => renderActionItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
        />
      </View>
    </Overlay>
  );
};

export default NotebookPanelMenu;
