import React from 'react';
import {ActivityIndicator, Button, FlatList, Text, View} from 'react-native';
// import {deleteImageFromSpot, getImageSrc} from './Images.container';
import {setForm} from "../form/form.container";
import {connect} from 'react-redux';
import imageStyles from "./images.styles";
import {Image} from "react-native-elements";
import {goToImageInfo} from "../../routes/Navigation";
import {notebookReducers} from "../notebook-panel/Notebook.constants";

const imageNotebook = (props) => {

  const getImageSrc = (id) => {
    return props.imagePaths[id]
  };

  const editImage = (image) => {
    props.setFormData(image);
    setForm('images');
    goToImageInfo(image.id);
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
          onPress={() => editImage(image)}
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

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(imageNotebook);
