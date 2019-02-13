import React, {Component} from 'react';
import {Text, View, Image,Dimensions, FlatList, Button, StyleSheet} from 'react-native';
import {getMapTiles} from '../services/maps/MapDownload';
import {Navigation} from "react-native-navigation";

const w = Dimensions.get('window');

export default class MapDownload extends Component {
  state= {};

  componentDidMount()  {
    console.log('props', this.props);
    getMapTiles(this.props.mapBounds).then(() => {
      console.log("Finished getting map tiles!");
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Map Download</Text>
        <Button
          onPress={() => Navigation.push(this.props.componentId, {
            component: {
              name: 'Home'
            }
          })}
          title="Go Back"
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  images: {
    width: 200,
    height: 200,
    margin: 10
  },
  imageList: {
    flex: 1,
    paddingTop: 50
  }
});
