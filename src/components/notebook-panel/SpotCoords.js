import React from 'react';
import {Text} from 'react-native';

const spotCoords = (props) => {
  return (
    <React.Fragment>
      <Text>{props.coords}</Text>
    </React.Fragment>
  );
};

export default spotCoords;
