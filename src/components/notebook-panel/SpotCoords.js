import React from 'react';
import {Text} from 'react-native';
import Aux from '../../shared/AuxWrapper';

const spotCoords = (props) => {
  return (
    <Aux>
      <Text>{props.coords}</Text>
    </Aux>
  );
};

export default spotCoords;
