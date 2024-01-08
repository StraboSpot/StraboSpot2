import React from 'react';
import {Text} from 'react-native';

import commonStyles from '../common.styles';

const ListEmptyText = ({text, textStyle}) => {
  return <Text style={[commonStyles.noValueText, textStyle]}>{text}</Text>;
};

export default ListEmptyText;
