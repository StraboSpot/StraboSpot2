import React from 'react';
import {Text, View} from 'react-native';

import {VERSION_NUMBER} from '../../shared/app.constants';

const About = () => {
  return (
    <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
      <Text style={{fontSize: 24}}>Version: {VERSION_NUMBER}</Text>
    </View>
  );
};

export default About;
