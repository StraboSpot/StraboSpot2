import React from 'react';
import {View} from 'react-native';

import {useSelector} from 'react-redux';

import {SMALL_SCREEN} from '../../../shared/styles.constants';
import IconButton from '../../../shared/ui/IconButton';
import {MAP_MODES} from '../../maps/maps.constants';
import homeStyles from '../home.style';
import useHome from '../useHome';

const DrawActionButtons = ({clickHandler, mapMode}) => {

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);

  const {changeDrawType, getDrawTypes, onLongPress} = useHome();

  return (
    <View style={homeStyles.drawToolsContainer}>
      {(currentImageBasemap || stratSection) ? (
        <IconButton
          source={mapMode === MAP_MODES.DRAW.POINT
            ? SMALL_SCREEN ? require('../../../assets/icons/Point_pressed_1.png')
              : require('../../../assets/icons/PointButton_pressed.png')
            : SMALL_SCREEN ? require('../../../assets/icons/Point.png')
              : require('../../../assets/icons/PointButton.png')}
          onPress={() => clickHandler(MAP_MODES.DRAW.POINT)}
          imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
        />
      ) : (
        <IconButton
          source={changeDrawType(MAP_MODES.DRAW.POINT, mapMode)}
          onPress={() => {
            if (getDrawTypes().point === MAP_MODES.DRAW.POINT) clickHandler(MAP_MODES.DRAW.POINT);
            else clickHandler(MAP_MODES.DRAW.POINTLOCATION);
          }}
          onLongPress={() => onLongPress('point')}
          imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
        />
      )}
      <IconButton
        source={changeDrawType(MAP_MODES.DRAW.LINE, mapMode)}
        onPress={() => {
          if (getDrawTypes().line === MAP_MODES.DRAW.LINE) clickHandler(MAP_MODES.DRAW.LINE);
          else clickHandler(MAP_MODES.DRAW.FREEHANDLINE);
        }}
        onLongPress={() => onLongPress('line')}
        imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
      />
      <IconButton
        source={changeDrawType(MAP_MODES.DRAW.POLYGON, mapMode)}
        onPress={() => {
          if (getDrawTypes().polygon === MAP_MODES.DRAW.POLYGON) clickHandler(MAP_MODES.DRAW.POLYGON);
          else clickHandler(MAP_MODES.DRAW.FREEHANDPOLYGON);
        }}
        onLongPress={() => onLongPress('polygon')}
        imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
      />
    </View>
  );
};

export default DrawActionButtons;
