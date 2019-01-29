import React from 'react'
import {View, Text, Button, StyleSheet, ScrollView} from 'react-native'
import {goToAuth, goSignIn} from '../navigation'
import {Navigation} from 'react-native-navigation';
import MapView from '../components/map/MapView';


export default class Home extends React.Component {

  static
  get options() {
    return {
      topBar: {
        title: {
          text: 'Home'
        },
      }
    };
  }

  logout = async () => {
    goSignIn();
  };

  render() {
    return (
      <ScrollView>
        <MapView/>
        <View style={styles.container}>
          <Text>Hello from Home screen.</Text>
          <View style={styles.button}>
            <Button
              onPress={this.logout}
              title="Sign Out"
            />
          </View>
          <Button
            onPress={() => {
              Navigation.push(this.props.componentId, {
                component: {
                  name: 'Screen2',
                }
              });
            }}
            title="View next screen"
          />
        </View>
      </ScrollView>
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
    width: '90%',
    height: 500
  }
});