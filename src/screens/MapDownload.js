import React, {Component} from 'react';
import {Text, View, Image,Dimensions, FlatList, Button, StyleSheet} from 'react-native';
import {getMapTiles} from '../maps/MapDownload';

const w = Dimensions.get('window');

export default class MapDownload extends Component {
  state= {};

  componentDidMount()  {
    getMapTiles().then(() => {
      console.log("Finished getting map tiles!");
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Map Download</Text>
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
