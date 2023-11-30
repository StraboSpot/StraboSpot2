import React from 'react';
import {View} from 'react-native';

import {BallIndicator} from 'react-native-indicators';

import styles from './ui.styles';

const Loading = ({color, count, isLoading, size, style}) => {

  return (
    <React.Fragment>
      {isLoading && <View style={[styles.backdrop, style]}>
        {/*<View style={home.loadingContainer}>*/}
        <BallIndicator
          color={color || 'darkgrey'}
          count={count || 8}
          size={size || 40}
        />
      </View>}
      {/*</View>*/}
    </React.Fragment>
  );
};

export default Loading;
