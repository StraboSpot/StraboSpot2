import React, {useState} from 'react';
import {Animated, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty, truncateText} from '../../shared/Helpers';
import IconButton from '../../shared/ui/IconButton';
import useImagesHook from '../images/useImages';
import {MAP_MODES} from '../maps/maps.constants';
import useMapsHook from '../maps/useMaps';
import useProjectHook from '../project/useProject';
import {clearedSelectedSpots} from '../spots/spots.slice';
import {SHORTCUT_MODALS} from './home.constants';
import {setModalVisible} from './home.slice';
import homeStyles from './home.style';

const RightSideButtons = (props) => {
  const dispatch = useDispatch();
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const shortcutSwitchPosition = useSelector(state => state.home.shortcutSwitchPosition);
  const selectedDatasetId = useSelector(state => state.project.selectedDatasetId);
  const stratSection = useSelector(state => state.map.stratSection);

  const [useImages] = useImagesHook();
  const [useMaps] = useMapsHook();
  const navigation = useNavigation();

  const [pointIconType, setPointIconType] = useState({
    point: MAP_MODES.DRAW.POINT,
    line: MAP_MODES.DRAW.LINE,
    polygon: MAP_MODES.DRAW.POLYGON,
  });

  const [useProject] = useProjectHook();

  const changeDrawType = (name) => {
    switch (pointIconType[name]) {
      case MAP_MODES.DRAW.POINT:
        return props.mapMode === MAP_MODES.DRAW.POINT
          ? require('../../assets/icons/PointButton_pressed.png')
          : require('../../assets/icons/PointButton.png');
      case MAP_MODES.DRAW.POINTLOCATION:
        return props.mapMode === MAP_MODES.DRAW.POINTLOCATION
          ? require('../../assets/icons/PointButtonCurrentLocation_pressed.png')
          : require('../../assets/icons/PointButtonCurrentLocation.png');
      case MAP_MODES.DRAW.LINE:
        return props.mapMode === MAP_MODES.DRAW.LINE
          ? require('../../assets/icons/LineButton_pressed.png')
          : require('../../assets/icons/LineButton.png');
      case MAP_MODES.DRAW.FREEHANDLINE:
        return props.mapMode === MAP_MODES.DRAW.FREEHANDLINE
          ? require('../../assets/icons/LineFreehandButton_pressed.png')
          : require('../../assets/icons/LineFreehandButton.png');
      case MAP_MODES.DRAW.POLYGON:
        return props.mapMode === MAP_MODES.DRAW.POLYGON
          ? require('../../assets/icons/PolygonButton_pressed.png')
          : require('../../assets/icons/PolygonButton.png');
      case MAP_MODES.DRAW.FREEHANDPOLYGON:
        return props.mapMode === MAP_MODES.DRAW.FREEHANDPOLYGON
          ? require('../../assets/icons/PolygonFreehandButton_pressed.png')
          : require('../../assets/icons/PolygonFreehandButton.png');
    }
  };

  const renderShortcutIcons = () => {
    const toggleShortcutModal = async (key) => {
      dispatch(clearedSelectedSpots());
      switch (key) {
        case 'photo':
          const point = await useMaps.setPointAtCurrentLocation();
          if (point) {
            console.log('New Spot at current location:', point);
            const imagesSavedLength = await useImages.launchCameraFromNotebook();
            imagesSavedLength > 0 && props.toastRef.current.show(
              imagesSavedLength + ' photo' + (imagesSavedLength === 1 ? '' : 's') + ' saved in new Spot ' + point.properties.name);
            props.openNotebookPanel();
          }
          break;
        default:
          if (modalVisible === key) await dispatch(setModalVisible({modal: null}));
          else await dispatch(setModalVisible({modal: key}));
          props.closeNotebookPanel();
      }
      if (key === 'sketch') navigation.navigate('Sketch');
    };

    return (
      <Animated.View
        style={[homeStyles.shortcutButtons, props.rightsideIconAnimation]}>
        {SHORTCUT_MODALS.reduce((acc, sm) => {
            return (
              shortcutSwitchPosition[sm.key] ? [...acc, (
                  <IconButton
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
      <Animated.View
        style={[homeStyles.notebookButton, props.rightsideIconAnimation]}>
        <IconButton
          source={isNotebookPanelVisible
            ? require('../../assets/icons/NotebookViewButton_pressed.png')
            : require('../../assets/icons/NotebookViewButton.png')}
          onPress={props.toggleNotebookPanel}
        />
      </Animated.View>
      {!currentImageBasemap && !stratSection && !isNotebookPanelVisible && renderShortcutIcons()}
      {props.drawButtonsVisible && (
        <Animated.View
          style={[homeStyles.drawToolsContainer, props.rightsideIconAnimation]}>
          {!isEmpty(selectedDatasetId)
          && [MAP_MODES.DRAW.POINT, MAP_MODES.DRAW.LINE, MAP_MODES.DRAW.FREEHANDLINE, MAP_MODES.DRAW.FREEHANDPOLYGON,
            MAP_MODES.DRAW.POLYGON, MAP_MODES.DRAW.MEASURE].includes(props.mapMode)
          && (
            <View style={homeStyles.selectedDatasetContainer}>
              {props.mapMode === MAP_MODES.DRAW.MEASURE ? (
                  <Text style={{textAlign: 'center'}}>Total Distance: {props.distance.toFixed(3)}km</Text>
                )
                : (
                  <React.Fragment>
                    <Text style={{textAlign: 'center'}}>Selected Dataset:</Text>
                    <Text style={{textAlign: 'center', fontWeight: 'bold'}}>{truncateText(
                      useProject.getSelectedDatasetFromId().name, 20)}
                    </Text>
                  </React.Fragment>
                )}
              <View style={commonStyles.buttonContainer}>
                {props.mapMode === MAP_MODES.DRAW.POINT ? (
                    <Text style={{textAlign: 'center'}}>Place a point on the map</Text>
                  )
                  : props.mapMode === MAP_MODES.DRAW.MEASURE ? (
                      <Button
                        containerStyle={{alignContent: 'center'}}
                        buttonStyle={homeStyles.drawToolsButtons}
                        titleStyle={homeStyles.drawToolsTitle}
                        title={'End Measurement'}
                        type={'clear'}
                        onPress={props.endMeasurement}
                      />
                    )
                    : (
                      <Button
                        containerStyle={{alignContent: 'center'}}
                        buttonStyle={homeStyles.drawToolsButtons}
                        titleStyle={homeStyles.drawToolsTitle}
                        title={'End Draw'}
                        type={'clear'}
                        onPress={props.endDraw}
                      />
                    )
                }
              </View>
            </View>
          )}
          <View style={{flexDirection: 'row'}}>
            {(currentImageBasemap || stratSection) ? (
                <IconButton
                  style={{top: 5}}
                  source={props.mapMode === MAP_MODES.DRAW.POINT
                    ? require('../../assets/icons/PointButton_pressed.png')
                    : require('../../assets/icons/PointButton.png')}
                  onPress={() => {
                    props.clickHandler(MAP_MODES.DRAW.POINT);
                  }}
                />)
              : (
                <IconButton
                  style={{top: 5}}
                  source={changeDrawType(MAP_MODES.DRAW.POINT)}
                  onPress={() => {
                    if (pointIconType.point === MAP_MODES.DRAW.POINT) props.clickHandler(MAP_MODES.DRAW.POINT);
                    else props.clickHandler(MAP_MODES.DRAW.POINTLOCATION);
                  }}
                  onLongPress={() => {
                    setPointIconType(prevState => ({
                        ...prevState,
                        point: pointIconType.point === MAP_MODES.DRAW.POINT
                          ? MAP_MODES.DRAW.POINTLOCATION
                          : MAP_MODES.DRAW.POINT,
                      }),
                    );
                  }}
                />)}
            <IconButton
              style={{top: 5}}
              source={changeDrawType(MAP_MODES.DRAW.LINE)}
              onPress={() => {
                if (pointIconType.line === MAP_MODES.DRAW.LINE) props.clickHandler(MAP_MODES.DRAW.LINE);
                else props.clickHandler(MAP_MODES.DRAW.FREEHANDLINE);
              }}
              onLongPress={() => setPointIconType(prevState => ({
                  ...prevState,
                  line: pointIconType.line === MAP_MODES.DRAW.LINE
                    ? MAP_MODES.DRAW.FREEHANDLINE
                    : MAP_MODES.DRAW.LINE,
                }),
              )}
            />
            <IconButton
              style={{top: 5}}
              source={changeDrawType(MAP_MODES.DRAW.POLYGON)}
              onPress={() => {
                if (pointIconType.polygon === MAP_MODES.DRAW.POLYGON) props.clickHandler(MAP_MODES.DRAW.POLYGON);
                else props.clickHandler(MAP_MODES.DRAW.FREEHANDPOLYGON);
              }}
              onLongPress={() => {
                setPointIconType(prevState => ({
                    ...prevState,
                    polygon: pointIconType.polygon === MAP_MODES.DRAW.POLYGON
                      ? MAP_MODES.DRAW.FREEHANDPOLYGON
                      : MAP_MODES.DRAW.POLYGON,
                  }),
                );
              }
              }
            />
          </View>
        </Animated.View>
      )}
    </React.Fragment>
  );
};

export default RightSideButtons;
