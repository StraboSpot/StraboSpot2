import React, {Component} from 'react';
import {Text, View, Image,Dimensions, ScrollView, Button, StyleSheet} from 'react-native';
import {Navigation} from "react-native-navigation";
import {getImages} from '../images/ImageDownload';
import ImageView from '../components/imageView/ImageView';

const w = Dimensions.get('window');

export default class Images extends Component {
  state= {
    imagesToDisplay: []
  };

  componentDidMount()  {
    const images = getImages()
    console.log("images from images.js", images)

  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Images Page</Text>
        <ImageView
          thumbnailSource={{ uri: `https://images.pexels.com/photos/671557/pexels-photo-671557.jpeg?w=50&buster=${Math.random()}` }}
          source={{ uri: `https://images.pexels.com/photos/671557/pexels-photo-671557.jpeg?w=${w.width * 2}&buster=${Math.random()}` }}
          style={{ width: w.width, height: w.width }}
          resizeMode="cover"
        />
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
  }
});
