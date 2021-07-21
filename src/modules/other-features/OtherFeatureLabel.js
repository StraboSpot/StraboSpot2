import React from 'react';
import {Text} from 'react-native';

const OtherFeatureLabel = (props) => {
  const getTitle = (feature) => {
    const firstClassTitle = feature.name || 'Unnamed Feature';
    const secondClassTitle = feature.type?.toUpperCase() || 'UNKNOWN';
    return firstClassTitle + ' - ' + secondClassTitle;
  };
  return (
    <Text>{getTitle(props.item)}</Text>
  );
};
export default OtherFeatureLabel;
