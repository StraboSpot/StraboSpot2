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
                                    dialogs,
                                    distance,
                                    endDraw,
                                    endMeasurement,
                                    mapMode,
                                    mapComponentRef,
                                    toggleDialog,
                                  }) => {

  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);

  return (
    <View>
      <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
        <DrawInfo
          distance={distance}
          endDraw={endDraw}
          endMeasurement={endMeasurement}
          mapMode={mapMode}
        />
      </View>
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
            backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
            borderColor: themes.MEDIUMGREY,
            borderRadius: 10,
            borderWidth: .5,
            elevation: 2,
            flexDirection: 'row',
            padding: 0,
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <View style={{borderColor: themes.MEDIUMGREY, borderRightWidth: 1}}>
            <MapActionButtons
              dialogClickHandler={dialogClickHandler}
              dialogs={dialogs}
              mapComponentRef={mapComponentRef}
              toggleDialog={toggleDialog}
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
