import React from 'react';
import {View, Alert, ActivityIndicator, StyleSheet} from 'react-native';

class loading extends React.Component {
  state = {
    animating: true
  };

  closeLoading = () => {
    setTimeout(() => {
    this.setState({animating: false});
    Alert.alert('Something Went Wrong!', 'Please go back')
    }, 5000)
  };

  // componentDidMount = () => this.closeLoading();

  render() {
    const animating = this.state.animating;
    return (
      <View style={styles.container}>
        <ActivityIndicator
          // animating={animating}
          size={'large'}
          color="#0000ff"/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
});

export default loading;

