import React from 'react';
import {Text} from 'react-native';
import Aux from '../../shared/AuxWrapper';

const SpotName = (props) => {
  return (
    <Aux >
      <Text style={props.style}>{props.name}</Text>
    </Aux>
  );
};

export default SpotName;
