import React from 'react';
import {Text, View} from 'react-native';
import * as Progress from 'react-native-progress';


const ProgressCircle = (props) => {
  return (
    <React.Fragment>
      <Progress.Circle
        progress={props.progress}
        size={60}
        showsText={true}
        color={'#1e90ff'}
      />
    </React.Fragment>
  );
};

export default ProgressCircle;
