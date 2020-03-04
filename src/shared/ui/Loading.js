import React from 'react';
import {View} from 'react-native';
import styles from './ui.styles';
import {BallIndicator} from 'react-native-indicators';

const Loading = props => {

  return (
    <React.Fragment>
      <View style={[styles.backdrop, props.style]}>
        {/*<View style={home.loadingContainer}>*/}
        <BallIndicator
          color={'darkgrey'}
          count={8}
          size={40}
        />
      </View>
      {/*</View>*/}
    </React.Fragment>
  );
};

export default Loading;
