import React from 'react';
import {Alert, Button, Image, ScrollView, Text, View} from 'react-native';
import {Navigation} from "react-native-navigation";
import {pictureSelectDialog, saveFile} from './Images.container';
import {connect} from "react-redux";
import imageStyles from './images.styles'
import {imageReducers} from "./Image.constants";
import SettingsPanelHeader from "../settings-panel/SettingsPanelHeader";

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

  return (
    <React.Fragment>
    <SettingsPanelHeader onPress={() => props.backToSettings()}>
      {props.children}
    </SettingsPanelHeader>
    <View style={imageStyles.container}>
      <ScrollView >
        <View style={imageStyles.galleryImageContainer}>
          {Object.values(props.imagePaths).map(image => {
            return <Image key={image} style={imageStyles.galleryImage} source={{uri: image}}/>
          })}
        </View>
      </ScrollView>
      {/*<Button*/}
      {/*  onPress={() => props.onPress()}*/}
      {/*  title="Go Back"*/}
      {/*/>*/}
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
    imagePaths: state.images.imagePaths
  }
};

const mapDispatchToProps = {
  addPhoto: (image) => ({type: imageReducers.ADD_PHOTOS, images: image})
};

export default connect(mapStateToProps, mapDispatchToProps)(imageGallery);
