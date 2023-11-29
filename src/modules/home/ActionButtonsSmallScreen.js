import React from 'react';
import {Dimensions, Platform, View} from 'react-native';

import * as themes from '../../shared/styles.constants';
import DrawActionButtons from './DrawActionButtons';
import MapActionButtons from './MapActionButtons';

const platform = Platform.OS === 'ios' ? 'screen' : 'window';
const {width} = Dimensions.get(platform);

const ActionButtonsSmallScreen = ({clickHandler, dialogClickHandler, mapMode, mapComponentRef}) => {

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
        borderRadius: 15,
        flexDirection: 'row',
        height: 70,
        justifyContent: 'center',
        width: width * 0.90,
      }}
    >
      <View style={{borderRightWidth: 2}}>
        <MapActionButtons
          dialogClickHandler={dialogClickHandler}
          mapComponentRef={mapComponentRef}
        />
      </View>
      <DrawActionButtons
        clickHandler={clickHandler}
        mapMode={mapMode}
      />
    </View>
  );
};

export default ActionButtonsSmallScreen;
