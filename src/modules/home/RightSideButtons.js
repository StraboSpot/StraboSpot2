import React from 'react';
import {Animated} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import IconButton from '../../shared/ui/IconButton';
import useImagesHook from '../images/useImages';
import useLocationHook from '../maps/useLocation';
import {MODAL_KEYS, SHORTCUT_MODALS} from '../page/page.constants';
import {clearedSelectedSpots} from '../spots/spots.slice';
import DrawActionButtons from './DrawActionButtons';
import DrawInfo from './DrawInfo';
import {setModalVisible} from './home.slice';
import homeStyles from './home.style';

const RightSideButtons = ({
                            clickHandler,
                            distance,
                            drawButtonsVisible,
                            endDraw,
                            endMeasurement,
                            mapMode,
                            openNotebookPanel,
                            rightsideIconAnimation,
                            toggleNotebookPanel,
                          }) => {
  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const shortcutSwitchPosition = useSelector(state => state.home.shortcutSwitchPosition);
  const stratSection = useSelector(state => state.map.stratSection);

  const [useImages] = useImagesHook();
  const navigation = useNavigation();
  const toast = useToast();
  const useLocation = useLocationHook();

  const renderShortcutIcons = () => {
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
      <Animated.View
        style={[homeStyles.shortcutButtons, rightsideIconAnimation]}>
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
      </Animated.View>
    );
  };

  return (
    <React.Fragment>
      {stratSection && (
        <Animated.View
          style={[homeStyles.addIntervalButton, rightsideIconAnimation]}>
          <IconButton
            source={isNotebookPanelVisible
              ? require('../../assets/icons/AddIntervalButton_pressed.png')
              : require('../../assets/icons/AddIntervalButton.png')}
            onPress={() => dispatch(setModalVisible({modal: MODAL_KEYS.OTHER.ADD_INTERVAL}))}
          />
        </Animated.View>
      )}
      <Animated.View
        style={[homeStyles.notebookButton, rightsideIconAnimation]}>
        <IconButton
          source={isNotebookPanelVisible
            ? require('../../assets/icons/NotebookViewButton_pressed.png')
            : require('../../assets/icons/NotebookViewButton.png')}
          onPress={toggleNotebookPanel}
        />
      </Animated.View>
      {!currentImageBasemap && !stratSection && !isNotebookPanelVisible && renderShortcutIcons()}
      {drawButtonsVisible && (
        <Animated.View style={[homeStyles.drawContainer, rightsideIconAnimation]}>
          <DrawInfo
            distance={distance}
            endDraw={endDraw}
            endMeasurement={endMeasurement}
            mapMode={mapMode}
          />
          <DrawActionButtons
            clickHandler={clickHandler}
            mapMode={mapMode}
          />
        </Animated.View>
      )}
    </React.Fragment>
  );
};

export default RightSideButtons;
