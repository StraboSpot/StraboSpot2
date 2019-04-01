import React from 'react';
import {Text} from 'react-native';

const spotName = (props) => {
  return (
    <React.Fragment>
      <Text>{props.name}</Text>
    </React.Fragment>
  );
};

export default spotName;
