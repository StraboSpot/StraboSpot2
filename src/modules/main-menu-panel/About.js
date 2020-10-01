import React from 'react';
import {Text, View} from 'react-native';

import {VERSION_NUMBER} from '../../shared/app.constants';
import commonStyles from '../../shared/common.styles';

const About = (props) => {
  return (
      <View>
        <Text style={{fontSize: 24}}>{VERSION_NUMBER}</Text>
      </View>
  );
};

export default About;
