import React from 'react';
import {Text, View} from 'react-native';

import {Button, Icon, Image} from 'react-native-elements';

import IGSNLogo from '../../assets/images/logos/IGSN_Logo_200.jpg';
import NoIGSNIcon from './NoIGSNIcon';

const IGSNDisplay = ({item, openModal}) => {
  return (
    <View style={{marginHorizontal: 5}}>
      {openModal && !item.isOnMySesar ? <Button
        buttonStyle={{flexDirection: 'column-reverse'}}
        title={'Get'}
        titleStyle={{fontSize: 14}}
        icon={<Image source={IGSNLogo} style={{width: 20, height: 20}} />}
        type={'clear'}
        onPress={() => openModal && openModal(item)}
      /> : item.isOnMySesar
        ? <Image
          source={IGSNLogo}
          style={{width: 30, height: 30}}
        />
        :
          <NoIGSNIcon/>
      }
    </View>
  );
};

export default IGSNDisplay;
