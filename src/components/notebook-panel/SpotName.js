import React from 'react';
import {Text} from 'react-native';

const spotName = (props) => {
  return (
    <Aux >
      <Text style={props.style}>{props.name}</Text>
    </Aux>
  );
};

export default spotName;
