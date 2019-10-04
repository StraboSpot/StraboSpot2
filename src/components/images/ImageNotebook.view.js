import React, {useState, useRef} from 'react';
import {Alert, ActivityIndicator, Button, FlatList, Text, View} from 'react-native';
import {setForm} from "../form/form.container";
import {connect} from 'react-redux';
import imageStyles from "./images.styles";
import {Image} from "react-native-elements";
import {goToImageInfo} from "../../routes/Navigation";
import {spotReducers} from "../../spots/Spot.constants";
import {imageReducers} from "./Image.constants";
import Modal from "react-native-modal";
import DeleteImageModal from "./DeleteImageModal";

const imageNotebook = (props) => {

  const [isDeleteImageModalVisible, setIsDeleteImageModalVisible] = useState(false);
  const [imageIdToDelete, setImageIdToDelete] = useState(null);

  const getImageSrc = (id) => {
    return props.imagePaths[id]
  };

  const deleteImage = (imageId) => {
    console.log(`Pressed OK to delete image: \n ${imageId}`);
    const updateImages = props.images.filter(image => image.id !== imageId)
    console.log(updateImages)
  };

  const editImage = (image) => {
    props.setSelectedAttributes([image]);
    setForm('images');
    goToImageInfo(image);
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
        <View style={{flexDirection: 'column'}}>
          <Button
            title={'Edit'}
            onPress={() => editImage(image)}
            style={imageStyles.editButton}
          />
          <Button
            title={'Delete'}
            onPress={() => Alert.alert('Delete Photo?', 'Are you sure you want to delete the selected photo?',
              [{text: 'DELETE', onPress: () => deleteImage(image.id)},
                {text: 'Cancel', onPress: () => console.log('Pressed CANCEL for delete')}
              ],
              {cancelable: false})}
            style={imageStyles.editButton}
          />
        </View>
      </View>
    )
  };

  return (
    <View>
      <FlatList
        data={props.images}
        renderItem={({item}) => renderImage(item)}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const mapStateToProps = (state) => {
  return {
    images: state.spot.selectedSpot.properties.images,
    imagePaths: state.images.imagePaths
  }
};

const mapDispatchToProps = {
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
  deleteImage: (imageId) => ({type: imageReducers.DELETE_PHOTOS, imageId: imageId})
};

export default connect(mapStateToProps, mapDispatchToProps)(imageNotebook);
