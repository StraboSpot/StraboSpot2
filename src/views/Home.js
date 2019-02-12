import React from 'react'
import {
  Alert,
  Image,
  View,
  Platform,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import {goToAuth, goSignIn} from '../routes/Navigation'
import MapView from '../components/map/MapView';
import Icon from 'react-native-vector-icons/Ionicons';
import ButtonWithBackground from '../ui/ButtonWithBackground';
import SquareIconButton from '../ui/SquareIconButton';

export default class Home extends React.Component {
  componentDidMount() {
    Icon.getImageSource("pin", 30)
  }
  logout = () => {
    goSignIn();
  };

  clickHandler = () => {
    //function to handle click on floating Action Button
    Alert.alert('Floating Button Clicked');
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView/>
        <View style={styles.squareIcon}>
        <SquareIconButton
          source={require('../assets/icons/Note.png')}
          onPress={this.clickHandler}
          style={{width: 30}}
        />
        </View>
        <View style={styles.squareIcon}>
        <SquareIconButton
          source={require('../assets/icons/Note.png')}
          onPress={this.clickHandler}
          style={{width: 30}}
        />
        </View>

        {/*<ButtonWithBackground*/}
          {/*color={"#407ad9"}*/}
          {/*onPress={this.logout}*/}
          {/*name={Platform.OS === 'android' ? "md-log-out" : "ios-log-out"}*/}
        {/*>Sign Out*/}
        {/*</ButtonWithBackground>*/}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center'
  },
  button: {
    margin: 25,
  },
  placeholder: {
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "#eee",
    width: "100%",
    height: "80%"
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    // height: 500,
  },
  // drawerItem: {
  //   // color: "green",
  //   // flexDirection: "row",
  //   alignItems: "baseline",
  //   paddingLeft: 20,
  //   paddingRight: 20,
  //   backgroundColor: "blue",
  //   borderRadius: 50
  //   },
  drawerItemIcon: {
    margin: 10,
  },
  drawerItemText: {
    color: "white"
  },
  TouchableOpacityStyle: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    right: "20%",
    bottom: "25%",
  },
  squareIcon : {
    paddingBottom: 20

  }
});