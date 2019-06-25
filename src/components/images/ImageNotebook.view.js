import React from 'react';
import {ActivityIndicator, Button, FlatList, Text, View} from 'react-native';
// import {deleteImageFromSpot, getImageSrc} from './Images.container';
import {connect} from 'react-redux';
import imageStyles from "./images.styles";
import {Image} from "react-native-elements";
import {goToImageInfo} from "../../routes/Navigation";

const imageNotebook = (props) => {

  const getImageSrc = (id) => {
    return props.imagePaths[id]
  };

  const renderImage = (image) => {
    // console.log('IMAGE', image);
    return (
      <View style={imageStyles.imageContainer}>
        <Image
          source={{uri: getImageSrc(image.id)}}
          style={imageStyles.notebookImage}
          PlaceholderContent={<ActivityIndicator/>}
        />
        <Button
          title={'Edit'}
          onPress={() => goToImageInfo(image.id)}
          style={imageStyles.editButton}
        />
      </View>
    )
  };

  return (
    <FlatList
      data={props.images}
      renderItem={({item}) => renderImage(item)}
      keyExtractor={(item) => item.id}
    />
  );
};

const mapStateToProps = (state) => {
  // console.log('MP to P', state)
  return {
    images: state.spot.selectedSpot.properties.images,
    imagePaths: state.images.imagePaths
  }
};

export default connect(mapStateToProps)(imageNotebook);
