import React from 'react'
import {View, Text, Button, Platform, StyleSheet, ScrollView, TouchableOpacity} from 'react-native'
import {goToAuth, goSignIn} from '../Navigation'
import MapView from '../components/map/MapView';
import Icon from 'react-native-vector-icons/Ionicons';
import {Navigation} from 'react-native-navigation';

export default class Home extends React.Component {
  componentDidMount() {
    Icon.getImageSource("pin", 30)
  }
 logout = () => {
    goSignIn();
  };

  render() {
    return (
      <View style={styles.container}>
          <MapView/>
        {/*<View style={styles.button}>*/}
        <TouchableOpacity onPress={this.logout}>
          <View style={styles.drawerItem}>
            <Icon
              style={styles.drawerItemIcon}
              name={Platform.OS === 'android' ? "md-log-out" : "ios-log-out"}
              size={30}
              color={"#aaa"}/>
            <Text style={styles.drawerItemText}
            >Sign Out</Text>
          </View>
        </TouchableOpacity>

          {/*</View>*/}
          <Button
            onPress={() => {
              Navigation.push(this.props.componentId, {
                component: {
                  name: 'Images',
                }
              });
            }}
            title="Go To Images"
          />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
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
  drawerItem: {
    color: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 50
    },
  drawerItemIcon: {
    margin: 10
  },
  drawerItemText: {
    color: "white"
  }
});