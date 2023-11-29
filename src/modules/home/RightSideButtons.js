import React, {useState} from 'react';
import {Animated, Platform, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Button} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, truncateText} from '../../shared/Helpers';
import IconButton from '../../shared/ui/IconButton';
import useImagesHook from '../images/useImages';
import {MAP_MODES} from '../maps/maps.constants';
import useLocationHook from '../maps/useLocation';
import {MODAL_KEYS, SHORTCUT_MODALS} from '../page/page.constants';
import useProjectHook from '../project/useProject';
import {clearedSelectedSpots} from '../spots/spots.slice';
import DrawActionButtons from './DrawActionButtons';
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
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);
  const shortcutSwitchPosition = useSelector(state => state.home.shortcutSwitchPosition);
  const stratSection = useSelector(state => state.map.stratSection);

  const [useImages] = useImagesHook();
  const [useProject] = useProjectHook();
  const navigation = useNavigation();
  const toast = useToast();
  const useLocation = useLocationHook();

  const [pointIconType, setPointIconType] = useState({
    point: MAP_MODES.DRAW.POINT,
    line: MAP_MODES.DRAW.LINE,
    polygon: MAP_MODES.DRAW.POLYGON,
  });

  const changeDrawType = (name) => {
    switch (pointIconType[name]) {
      case MAP_MODES.DRAW.POINT:
        return mapMode === MAP_MODES.DRAW.POINT
          ? require('../../assets/icons/PointButton_pressed.png')
          : require('../../assets/icons/PointButton.png');
      case MAP_MODES.DRAW.POINTLOCATION:
        return mapMode === MAP_MODES.DRAW.POINTLOCATION
          ? require('../../assets/icons/PointButtonCurrentLocation_pressed.png')
          : require('../../assets/icons/PointButtonCurrentLocation.png');
      case MAP_MODES.DRAW.LINE:
        return mapMode === MAP_MODES.DRAW.LINE
          ? require('../../assets/icons/LineButton_pressed.png')
          : require('../../assets/icons/LineButton.png');
      case MAP_MODES.DRAW.FREEHANDLINE:
        return mapMode === MAP_MODES.DRAW.FREEHANDLINE
          ? require('../../assets/icons/LineFreehandButton_pressed.png')
          : require('../../assets/icons/LineFreehandButton.png');
      case MAP_MODES.DRAW.POLYGON:
        return mapMode === MAP_MODES.DRAW.POLYGON
          ? require('../../assets/icons/PolygonButton_pressed.png')
          : require('../../assets/icons/PolygonButton.png');
      case MAP_MODES.DRAW.FREEHANDPOLYGON:
        return mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON
          ? require('../../assets/icons/PolygonFreehandButton_pressed.png')
          : require('../../assets/icons/PolygonFreehandButton.png');
    }
  };

  const onLongPress = (type) => {
    if (Platform.OS === 'ios') {
      switch (type) {
        case 'point':
          setPointIconType(prevState => ({
              ...prevState,
              point: pointIconType.point === MAP_MODES.DRAW.POINT
                ? MAP_MODES.DRAW.POINTLOCATION
                : MAP_MODES.DRAW.POINT,
            }),
          );
          break;
        case 'line':
          setPointIconType(prevState => ({
              ...prevState,
              line: pointIconType.line === MAP_MODES.DRAW.LINE
                ? MAP_MODES.DRAW.FREEHANDLINE
                : MAP_MODES.DRAW.LINE,
            }),
          );
          break;
        case 'polygon':
          setPointIconType(prevState => ({
              ...prevState,
              polygon: pointIconType.polygon === MAP_MODES.DRAW.POLYGON
                ? MAP_MODES.DRAW.FREEHANDPOLYGON
                : MAP_MODES.DRAW.POLYGON,
            }),
          );
          break;
      }
    }
  };

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
        <Animated.View
          style={[homeStyles.drawContainer, rightsideIconAnimation]}>
          {!isEmpty(selectedDatasetId)
            && [MAP_MODES.DRAW.POINT, MAP_MODES.DRAW.LINE, MAP_MODES.DRAW.FREEHANDLINE, MAP_MODES.DRAW.FREEHANDPOLYGON,
              MAP_MODES.DRAW.POLYGON, MAP_MODES.DRAW.MEASURE].includes(mapMode)
            && (
              <View style={homeStyles.selectedDatasetContainer}>
                {mapMode === MAP_MODES.DRAW.MEASURE ? (
                    <Text style={{textAlign: 'center'}}>Total Distance: {distance.toFixed(3)}km</Text>
                  )
                  : (
                    <React.Fragment>
                      <Text style={{textAlign: 'center'}}>Selected Dataset:</Text>
                      <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
                        {truncateText(useProject.getSelectedDatasetFromId().name, 20)}
                      </Text>
                    </React.Fragment>
                  )}
                <View style={{}}>
                  {mapMode === MAP_MODES.DRAW.POINT ? (
                    <View>
                      <Text style={{textAlign: 'center'}}>Place a point </Text>
                      <Text style={{textAlign: 'center'}}>on the map</Text>
                    </View>
                    )
                    : mapMode === MAP_MODES.DRAW.MEASURE ? (
                        <Button
                          containerStyle={{alignContent: 'center'}}
                          buttonStyle={homeStyles.drawToolsButtons}
                          titleStyle={homeStyles.drawToolsTitle}
                          title={'End Measurement'}
                          type={'clear'}
                          onPress={endMeasurement}
                        />
                      )
                      : (
                        <Button
                          containerStyle={{alignContent: 'center'}}
                          buttonStyle={homeStyles.drawToolsButtons}
                          titleStyle={homeStyles.drawToolsTitle}
                          title={'End Draw'}
                          type={'clear'}
                          onPress={endDraw}
                        />
                      )
                  }
                </View>
              </View>
            )}
          {(currentImageBasemap || stratSection) ? (
              <IconButton
                source={mapMode === MAP_MODES.DRAW.POINT
                  ? require('../../assets/icons/PointButton_pressed.png')
                  : require('../../assets/icons/PointButton.png')}
                onPress={() => {
                  clickHandler(MAP_MODES.DRAW.POINT);
                }}
              />)
            : (
              <DrawActionButtons
                clickHandler={clickHandler}
                onLongPress={type => onLongPress(type)}
                changeDrawType={name => changeDrawType(name)}
                pointIconType={pointIconType}
              />
            )}
        </Animated.View>
      )}
    </React.Fragment>
  );
};

export default RightSideButtons;
