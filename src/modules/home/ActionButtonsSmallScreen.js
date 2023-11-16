import React, {useState} from 'react';
import {Dimensions, Platform, View} from 'react-native';

import * as themes from '../../shared/styles.constants';
import {MAP_MODES} from '../maps/maps.constants';
import DrawActionButtons from './DrawActionButtons';
import MapActionButtons from './MapActionButtons';
import useHomeHook from './useHome';


const platform = Platform.OS === 'ios' ? 'screen' : 'window';
const {width} = Dimensions.get(platform);

const ActionButtonsSmallScreen = ({clickHandler, dialogClickHandler, endDraw, endMeasurement, mapMode , toggleDialog, zoomToCustomMap, zoomToCenterOfflineTile}) => {

  const useHome = useHomeHook();

  const [pointIconType, setPointIconType] = useState({
    point: MAP_MODES.DRAW.POINT,
    line: MAP_MODES.DRAW.LINE,
    polygon: MAP_MODES.DRAW.POLYGON,
  });

  return (
    <View style={{
      height: 70,
      width: width * 0.90,
      backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
    }}>
      <View style={{borderRightWidth: 2}}>
      <MapActionButtons
        dialogClickHandler={dialogClickHandler}
        zoomToCustomMap={zoomToCustomMap}
        zoomToCenterOfflineTile={zoomToCenterOfflineTile}
      />
      </View>
      <DrawActionButtons
        clickHandler={clickHandler}
        onLongPress={type => useHome.onLongPress(type)}
        changeDrawType={name => useHome.changeDrawType(name, mapMode)}
        pointIconType={pointIconType}
        mapMode={mapMode}
      />
    </View>
  );
};

export default ActionButtonsSmallScreen;
