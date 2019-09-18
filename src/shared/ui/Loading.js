import React from 'react';
import {View, Alert, ActivityIndicator, StyleSheet} from 'react-native';

class loading extends React.Component {
  state = {
    animating: true
  };

const Loading = props => {

  return (
    <React.Fragment>
    <View style={styles.backdrop}>
    <View style={styles.loadingContainer}>
      <BallIndicator
        color={'darkgrey'}
        count={8}
        size={40}
      />
    </View>
    </View>
    </React.Fragment>
  )
};

export default Loading;
