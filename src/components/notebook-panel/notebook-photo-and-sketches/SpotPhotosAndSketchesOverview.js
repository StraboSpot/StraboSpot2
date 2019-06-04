import React, {useState, useEffect} from 'react';
import {ActivityIndicator, Button, FlatList, ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {Image} from 'react-native-elements';
import styles from './SpotPhotosAndSketchesOverviewStyles';
import IconButton from '../../../ui/IconButton';

const PhotosAndSketches = props => {

  const getImageSrc = (id) => {
    // console.log(props.imagePaths[id])
    // console.log(id)
    // const imageId = props.images.map(image => {
    //   // console.log(image);
    //   return image.id
    // })
    // for (let i = 0; i < imageId.length; i++) {
    //   // console.log('ImageId[i]', imageId[i])
    //   imageSrc = props.getImageSrc.filter(image => {
    //     return image.id === imageId[i]
    //   })
    // }
    // console.log('imageSrc', imageSrc[0].src)
    return props.imagePaths[id]
  };

  const renderImage = (image) => {
    console.log('IMAGE', image)

    return (
      <View style={styles.imageContainer}>
        <Image
          // source={{uri: images.item.src}}
          source={{uri: getImageSrc(image.id)}}
          style={styles.image}
          PlaceholderContent={<ActivityIndicator/>}
        />
        <Button
          title={'Edit'}
          onPress={() => console.log("Image Id: ", image.id)}
          style={styles.editButton}
        />
      </View>
    )
  };

  return (
    <View>
      <View>
        <Text style={props.style}>{props.photosAndSketches}</Text>
      </View>
      <FlatList
        data={props.images}
        renderItem={({item}) => renderImage(item)}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
};
const mapStateToProps = (state) => {
  console.log('MP to P', state)
  return {
    images: state.home.selectedSpot.properties.images,
    imagePaths: state.images.imagePaths
  }
};

export default connect(mapStateToProps, null)(PhotosAndSketches);
