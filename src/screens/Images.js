import React, {Component} from 'react';
import {Text, View, Image,Dimensions, FlatList, Button, StyleSheet} from 'react-native';
import {Navigation} from "react-native-navigation";
import {getRemoteImages, getImages} from '../images/ImageDownload';
import ImageView from '../components/imageView/ImageView';

const w = Dimensions.get('window');

export default class Images extends Component {
  state= {
    imagesToDisplay: []
  };

  componentDidMount()  {
    getRemoteImages().then(() => {
      console.log("Finished getting images!");
      this.setState({
        imagesToDisplay: getImages()
      });
      console.log("State", this.state.imagesToDisplay);
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Images Page</Text>
        <FlatList
          style={styles.imageList}
          data={this.state.imagesToDisplay}
          numColumns={3}
          renderItem={({item}) =>
            <ImageView
            thumbnailSource={{ uri: item}}
            style={styles.images}
            resizeMode="cover"
          />}
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
