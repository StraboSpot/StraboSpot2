import React from 'react';
import {View} from 'react-native';

import {Button, Image} from '@rn-vui/base';
import {useSelector} from 'react-redux';

import sampleStyles from './samples.styles';
import IGSNLogo from '../../assets/images/logos/IGSN_Logo_200.jpg';

const IGSNDisplay = ({item, openModal}) => {
  return (
    <View style={sampleStyles.logoDisplayContainer}>
      {item.isOnMySesar
        && (
          <Image
            source={IGSNLogo}
            style={sampleStyles.IGSNLogo}
          />
        )
      }
    </View>
  );
};

export default IGSNDisplay;
