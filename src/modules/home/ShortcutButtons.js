import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import {setModalVisible} from './home.slice';
import IconButton from '../../shared/ui/IconButton';
import useImagesHook from '../images/useImages';
import useLocationHook from '../maps/useLocation';
import {SHORTCUT_MODALS} from '../page/page.constants';
import {clearedSelectedSpots} from '../spots/spots.slice';

const ShortcutButtons = ({openNotebookPanel}) => {
  console.log('Rendering ShortcutButtons...');

  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const shortcutSwitchPosition = useSelector(state => state.home.shortcutSwitchPosition);

  const [useImages] = useImagesHook();
  const navigation = useNavigation();
  const toast = useToast();
  const useLocation = useLocationHook();

  const toggleShortcutModal = async (key) => {
    dispatch(clearedSelectedSpots());
    switch (key) {
      case 'photo': {
        const point = await useLocation.setPointAtCurrentLocation();
        if (point) {
          console.log('New Spot at current location:', point);
          const imagesSavedLength = await useImages.launchCameraFromNotebook();
          imagesSavedLength > 0 && toast.show(
            imagesSavedLength + ' photo' + (imagesSavedLength === 1 ? '' : 's') + ' saved in new Spot '
            + point.properties.name, {type: 'success'},
          );
          openNotebookPanel();
        }
        break;
      }
      case 'sketch': {
        const point = await useLocation.setPointAtCurrentLocation();
        if (point) navigation.navigate('Sketch');
        openNotebookPanel();
        break;
      }
      default:
        if (modalVisible === key) dispatch(setModalVisible({modal: null}));
        else dispatch(setModalVisible({modal: key}));
    }
  };

  return (
    <>
      {SHORTCUT_MODALS.reduce((acc, sm) => {
          return (
            shortcutSwitchPosition[sm.key] ? [...acc, (
                <IconButton
                  key={sm.key}
                  source={modalVisible === sm.key ? sm.icon_pressed_src : sm.icon_src}
                  onPress={() => toggleShortcutModal(sm.key)}
                />
              )]
              : acc
          );
        }, [],
      )}
    </>
  );
};

export default ShortcutButtons;
