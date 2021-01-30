import React from 'react';
import {Text} from 'react-native';

import commonStyles from '../common.styles';

const ListEmptyText = (props) => {
  return <Text style={commonStyles.noValueText}>{props.text}</Text>;
};

export default ListEmptyText;
