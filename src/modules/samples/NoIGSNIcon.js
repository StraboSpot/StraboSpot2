import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import {Icon, Image} from 'react-native-elements';

import IGSNLogo from '../../assets/images/logos/IGSN_Logo_200.jpg';


const NoIGSNIcon = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
      <Image
      source={IGSNLogo}
      style={{width: 20, height: 20 }}
      />
      </View>
        <Icon
          name='cancel'
          type={'material-community'}
          size={35}
          color='red'
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageContainer: {
    alignItems: 'center',
    position: 'absolute',
  },
});

export default NoIGSNIcon;
