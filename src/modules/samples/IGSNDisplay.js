import React from 'react';
import {View} from 'react-native';

import {Button, Image} from 'react-native-elements';

import sampleStyles from './samples.styles';
import IGSNLogo from '../../assets/images/logos/IGSN_Logo_200.jpg';

const IGSNDisplay = ({item, openModal}) => {
  return (
    <View style={sampleStyles.logoDisplayContainer}>
      {openModal && !item.isOnMySesar ? <Button
        buttonStyle={{flexDirection: 'column-reverse'}}
        title={'Get'}
        titleStyle={{fontSize: 14, color: 'black'}}
        icon={<Image source={IGSNLogo} style={sampleStyles.IGSNLogoSmall}/>}
        type={'clear'}
        onPress={() => openModal && openModal(item)}
      /> : item.isOnMySesar
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
