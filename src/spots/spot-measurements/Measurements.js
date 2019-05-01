import React from 'react';
import {Text, View} from 'react-native';
import Compass from '../../components/compass/Compass';

const MeasurementPage = (props) => {
  return (
    <React.Fragment>
      <Text>This is the measurements page</Text>
      <View >
        <Compass/>
      </View>
    </React.Fragment>
  );
};

export default MeasurementPage;
