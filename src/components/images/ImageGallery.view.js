import React from 'react';
import {Alert, Button, Image, ScrollView, Text, View} from 'react-native';
import {Navigation} from "react-native-navigation";
import {pictureSelectDialog, saveFile} from './Images.container';
import {connect} from "react-redux";
import imageStyles from './images.styles'
import {imageReducers} from "./Image.constants";
import SettingsPanelHeader from "../settings-panel/SettingsPanelHeader";
import ImageButton from '../../shared/ui/ImageButton';


const imageGallery = (props) => {
  let savedArray = [];

  const imageSave = async () => {

    console.log('JJAJAJ', savedArray);

    const savedPhoto = await pictureSelectDialog();
    console.log('imageObj', savedPhoto);

    if (savedPhoto === 'cancelled') {
      console.log('User cancelled image picker', savedArray);
      if (savedArray.length > 0) {
        console.log('ALL PHOTOS SAVED', savedArray);
        props.addPhoto(savedArray);
      }
      else {
        Alert.alert('No Photos To Save', 'please try again...')
      }
    }
    else if (savedPhoto.error) {
      console.log('ImagePicker Error: ', savedPhoto.error);
    }
    else {
      savedArray.push(savedPhoto);
      console.log('AllPhotosSaved', savedArray);
      imageSave();
    }
  };

  const renderName = (item) => {
    console.log(item.properties.name);
    return (
      <View style={imageStyles.galleryImageListContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={imageStyles.headingText}>
            {item.properties.name}
          </Text>
          <Button title={'View In Spot'} onPress={() => console.log('View In Spot pressed\n', item.properties.id, '\n', item.properties.name)}/>
        </View>
        <FlatList
          keyExtractor={(item) => item.id}
          data={item.properties.images}
          numColumns={3}
          renderItem={({item}) => renderImage(item)} />
      </View>
    )
  };

  const renderImage = (image) => {
    console.log('IMAGE', image.id);
    return (
      <View style={imageStyles.galleryImageListContainer}>
        <ImageButton
          source={{uri: getImageSrc(image.id)}}
          style={imageStyles.galleryImage}
          PlaceholderContent={<ActivityIndicator/>}
          onPress={() => console.log(image.id, '\n was pressed!')}
        />
      </View>
    )
  };

  const getImageSrc = (id) => {
    return props.imagePaths[id]
  };

  return (
    <React.Fragment>
      <SettingsPanelHeader onPress={() => props.backToSettings()}>
        {props.children}
      </SettingsPanelHeader>
      <View style={imageStyles.container}>
        <ScrollView>
          <View style={imageStyles.galleryImageContainer}>
            <FlatList
              keyExtractor={(item) => item.properties.id.toString()}
              data={props.spot}
              renderItem={({item}) => renderName(item)}/>
          </View>
        </ScrollView>
        <Button
          onPress={() => imageSave()}
          title="Picture"
        />
      </View>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    imagePaths: state.images.imagePaths,
    spot: state.spot.features
  }
};

const mapDispatchToProps = {
  addPhoto: (image) => ({type: imageReducers.ADD_PHOTOS, images: image})
};

export default connect(mapStateToProps, mapDispatchToProps)(imageGallery);
