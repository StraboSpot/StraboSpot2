import React from 'react';
import {useWindowDimensions, View} from 'react-native';

import {UserLocationButton} from './buttons';
import DrawActionButtons from './DrawActionButtons';
import DrawInfo from './DrawInfo';
import homeStyles from './home.style';
import MapActionButtons from './MapActionButtons';
import * as themes from '../../shared/styles.constants';

const ActionButtonsSmallScreen = ({
                                    clickHandler,
                                    dialogClickHandler,
                                    dialogs,
                                    distance,
                                    onEndDrawPressed,
                                    endMeasurement,
                                    mapMode,
                                    mapComponentRef,
                                    toggleDialog,
                                  }) => {

  const {height, width} = useWindowDimensions();

  return (
    <View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
        {width < height ? <UserLocationButton clickHandler={clickHandler}/>
          : <View/> //Added so 'space-between' would work correctly for DrawInfo when no UserLocationButton
        }

        <DrawInfo
          distance={distance}
          endMeasurement={endMeasurement}
          mapMode={mapMode}
          onEndDrawPressed={onEndDrawPressed}
        />
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center', paddingTop: 5}}>
        {height < width && <UserLocationButton clickHandler={clickHandler}/>}

        <View
          style={{
            alignItems: 'center',
            backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
            borderColor: themes.MEDIUMGREY,
            borderRadius: 10,
            borderWidth: 0.5,
            elevation: 2,
            flexDirection: 'row',
            padding: 0,
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <View style={homeStyles.smallScreenMapActionButtons}>
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
              mapMode={mapMode}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default ActionButtonsSmallScreen;
