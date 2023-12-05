import React from 'react';
import {View} from 'react-native';

import {useSelector} from 'react-redux';

import * as themes from '../../shared/styles.constants';
import IconButton from '../../shared/ui/IconButton';
import DrawActionButtons from './DrawActionButtons';
import DrawInfo from './DrawInfo';
import MapActionButtons from './MapActionButtons';

const ActionButtonsSmallScreen = ({
                                    clickHandler,
                                    dialogClickHandler,
                                    distance,
                                    endDraw,
                                    endMeasurement,
                                    mapMode,
                                    mapComponentRef,
                                  }) => {

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);

  return (
    <View style={{alignItems: 'flex-end'}}>
      <DrawInfo
        distance={distance}
        endDraw={endDraw}
        endMeasurement={endMeasurement}
        mapMode={mapMode}
      />
      <View style={{flexDirection: 'row', alignItems: 'center', paddingTop: 5}}>
        {(currentImageBasemap || stratSection) && (
          <View style={{paddingRight: 40}}>
            {currentImageBasemap && (
              <IconButton
                source={require('../../assets/icons/Close.png')}
                onPress={() => clickHandler('closeImageBasemap')}
              />
            )}
            {stratSection && (
              <IconButton
                source={require('../../assets/icons/Close.png')}
                onPress={() => clickHandler('closeStratSection')}
              />
            )}
          </View>
        )}
        <View
          style={{
            alignItems: 'center',
            backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
            borderRadius: 10,
            flexDirection: 'row',
            padding: 5,
          }}
        >
          <View style={{borderRightWidth: 2}}>
            <MapActionButtons
              dialogClickHandler={dialogClickHandler}
              mapComponentRef={mapComponentRef}
            />
          </View>
          <View style={{paddingLeft: 10}}>
            <DrawActionButtons
              clickHandler={clickHandler}
              distance={distance}
              endDraw={endDraw}
              endMeasurement={endMeasurement}
              mapMode={mapMode}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default ActionButtonsSmallScreen;
