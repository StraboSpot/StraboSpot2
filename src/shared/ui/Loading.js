import React from 'react';
import {View} from 'react-native';

import {BallIndicator} from 'react-native-indicators';

import styles from './ui.styles';

const Loading = (props) => {

  return (
    <React.Fragment>
      {props.isLoading && <View style={[styles.backdrop, props.style]}>
        {/*<View style={home.loadingContainer}>*/}
        <BallIndicator
          color={'darkgrey'}
          count={8}
          size={props.size || 40}
        />
      </View>}
      {/*</View>*/}
    </React.Fragment>
  );
};

export default Loading;
