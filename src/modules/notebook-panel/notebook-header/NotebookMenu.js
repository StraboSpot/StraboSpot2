import React, {useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {ListItem, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../../shared/common.styles';
import {SMALL_SCREEN} from '../../../shared/styles.constants';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';
import {WarningModal} from '../../home/modals';
import {setLoadingStatus} from '../../home/home.slice';
import overlayStyles from '../../home/overlays/overlay.styles';
import useStratSectionHook from '../../maps/strat-section/useStratSection';
import {PAGE_KEYS} from '../../page/page.constants';
import useSpotsHook from '../../spots/useSpots';
import {setNotebookPageVisible} from '../notebook.slice';
import notebookStyles from '../notebookPanel.styles';

const NotebookMenu = ({closeNotebookMenu, isNotebookMenuVisible, zoomToSpot}) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [isDeleteSpotModalVisible, setIsDeleteSpotModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [useSpots] = useSpotsHook();
  const navigation = useNavigation();
  const useStratSection = useStratSectionHook();

  const actions = [
    {key: 'copy', title: 'Copy this Spot'},
    {key: 'zoom', title: 'Zoom to this Spot'},
    {key: 'delete', title: 'Delete this Spot'},
    {key: 'nesting', title: 'Show Nesting'},
  ];

  useEffect(() => {
    console.log(isDeleteSpotModalVisible);
  }, [isDeleteSpotModalVisible]);

  const continueDeleteSelectedSpot = () => {
    if (useSpots.isStratInterval(spot)) useStratSection.deleteInterval(spot);
    else useSpots.deleteSpot(spot.properties.id);
  };

  const deleteSelectedSpot = () => {
    setErrorMessage(useSpots.checkIsSafeDelete(spot));
    setIsDeleteSpotModalVisible(true);
  };

  const onPress = (key) => {
    if (key === 'copy') {
      useSpots.copySpot().catch(err => console.log('Error copying Spot!', err));
      dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
    }
    else if (key === 'zoom') {
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      if (SMALL_SCREEN) navigation.navigate('HomeScreen', {screen: 'Map'});
      setTimeout(() => {
        zoomToSpot();
        dispatch(setLoadingStatus({view: 'home', bool: false}));
      }, 500);
    }
    else if (key === 'delete') deleteSelectedSpot();
    else if (key === 'nesting') dispatch(setNotebookPageVisible(PAGE_KEYS.NESTING));
    closeNotebookMenu();
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

  const renderDeleteMessage = () => {
    return (
      errorMessage ? <Text>Unable to delete spot.{'\n'}{errorMessage}</Text>
        : <Text>Are you sure you want to delete Spot: {spot.properties.name}?</Text>
    );
  };

  return (
    <>
      <Overlay
        fullScreen={true}
        isVisible={isNotebookMenuVisible}
        onBackdropPress={closeNotebookMenu}
        overlayStyle={[overlayStyles.overlayContainer, notebookStyles.dialogBoxPosition]}
      >
        <View style={overlayStyles.titleContainer}>
          <Text style={overlayStyles.titleText}>Spot Actions</Text>
        </View>
        <FlatList
          key={'notebookActions'}
          data={actions}
          contentContainerStyle={{alignItems: 'center'}}
          renderItem={({item}) => renderActionItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
        />
      </Overlay>
      <WarningModal
        title={'Delete Spot?'}
        isVisible={isDeleteSpotModalVisible}
        closeTitle={errorMessage ? 'Ok' : 'Cancel'}
        closeModal={() => setIsDeleteSpotModalVisible(false)}
        showCancelButton={true}
        showConfirmButton={isDeleteSpotModalVisible && !errorMessage}
        confirmText={'DELETE'}
        confirmTitleStyle={overlayStyles.importantText}
        onConfirmPress={() => continueDeleteSelectedSpot()}
      >
        {renderDeleteMessage()}
      </WarningModal>
    </>
  );
};

export default NotebookMenu;
