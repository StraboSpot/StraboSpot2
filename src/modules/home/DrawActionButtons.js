import React from 'react';
import {View} from 'react-native';

import {useSelector} from 'react-redux';

import homeStyles from './home.style';
import useHomeHook from './useHome';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import IconButton from '../../shared/ui/IconButton';
import {MAP_MODES} from '../maps/maps.constants';

const DrawActionButtons = ({clickHandler, mapMode}) => {

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);

  const useHome = useHomeHook();

  return (
    (currentImageBasemap || stratSection) ? (
      <IconButton
        source={mapMode === MAP_MODES.DRAW.POINT
          ? SMALL_SCREEN ? require('../../assets/icons/Point_pressed_1.png')
            : require('../../assets/icons/PointButton_pressed.png')
          : SMALL_SCREEN ? require('../../assets/icons/Point.png')
            : require('../../assets/icons/PointButton.png')}
        onPress={() => clickHandler(MAP_MODES.DRAW.POINT)}
        imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
      />
    ) : (
      <View style={homeStyles.drawToolsContainer}>
        <IconButton
          source={useHome.changeDrawType(MAP_MODES.DRAW.POINT, mapMode)}
          onPress={() => {
            if (useHome.getDrawTypes().point === MAP_MODES.DRAW.POINT) clickHandler(MAP_MODES.DRAW.POINT);
            else clickHandler(MAP_MODES.DRAW.POINTLOCATION);
          }}
          onLongPress={() => useHome.onLongPress('point')}
          imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
        />
        <IconButton
          source={useHome.changeDrawType(MAP_MODES.DRAW.LINE, mapMode)}
          onPress={() => {
            if (useHome.getDrawTypes().line === MAP_MODES.DRAW.LINE) clickHandler(MAP_MODES.DRAW.LINE);
            else clickHandler(MAP_MODES.DRAW.FREEHANDLINE);
          }}
          onLongPress={() => useHome.onLongPress('line')}
          imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
        />
        <IconButton
          source={useHome.changeDrawType(MAP_MODES.DRAW.POLYGON, mapMode)}
          onPress={() => {
            if (useHome.getDrawTypes().polygon === MAP_MODES.DRAW.POLYGON) clickHandler(MAP_MODES.DRAW.POLYGON);
            else clickHandler(MAP_MODES.DRAW.FREEHANDPOLYGON);
          }}
          onLongPress={() => useHome.onLongPress('polygon')}
          imageStyle={SMALL_SCREEN && homeStyles.iconSizeSmallScreen}
        />
      </View>
    )
  );
};

export default DrawActionButtons;
