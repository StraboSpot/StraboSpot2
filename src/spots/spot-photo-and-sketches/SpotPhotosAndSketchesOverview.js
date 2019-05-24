import React, {Component} from 'react';
import {ActivityIndicator, Button,FlatList, ScrollView, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {Image} from 'react-native-elements';
import styles from './SpotPhotosAndSketchesOverviewStyles';
import IconButton from '../../ui/IconButton';

const PhotosAndSketches = props => {

  const image = image => (
    <View style={styles.imageContainer}>
      <Image
        source={{uri: image.item.src}}
        style={styles.image}
        PlaceholderContent={<ActivityIndicator/>}
      />
      <Button
        title={'Edit'}
        onPress={() => console.log("Image Id: ", image.item.id)}
        style={styles.editButton}
      />
    </View>
  );

  return (
  <View>
    <View>
      <Text style={props.style}>{props.photosAndSketches}</Text>
    </View>
    <View >
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={props.getImages}
        renderItem={image}
        />
    </View>


    {/*<View style={styles.imageContainer}>*/}
    {/*<Image*/}
    {/*  source={require('../../assets/images/geological_placeholder_resized.jpg')}*/}
    {/*  style={{width: 150, height: 150}}*/}
    {/*  PlaceholderContent={<ActivityIndicator />}*/}
    {/*  containerStyle={{marginRight: 40}}*/}
    {/*/>*/}
    {/*<View style={[spotStyles.imageContainer]}>*/}
    {/*  <IconButton*/}
    {/*    source={require('../../assets/icons/SetBaseMapButton.png')}*/}
    {/*    style={spotStyles.iconButton}*/}
    {/*  />*/}
    {/*  <IconButton*/}
    {/*    source={require('../../assets/icons/SketchButton.png')}*/}
    {/*    style={spotStyles.iconButton}*/}
    {/*  />*/}
    {/*  <IconButton*/}
    {/*    source={require('../../assets/icons/NoteButton.png')}*/}
    {/*    style={spotStyles.iconButton}*/}
    {/*  />*/}
    {/*</View>*/}
    {/*<View>*/}
    {/*<Image*/}
    {/*  source={{uri: 'https://f4.bcbits.com/img/a0561741859_10.jpg'}}*/}
    {/*  style={{width: 125, height: 150}}*/}
    {/*  PlaceholderContent={<ActivityIndicator />}*/}
    {/*/>*/}
    {/*<View style={[spotStyles.imageContainer]}>*/}
    {/*  <IconButton*/}
    {/*    source={require('../../assets/icons/SetBaseMapButton.png')}*/}
    {/*    style={spotStyles.iconButton}*/}
    {/*  />*/}
    {/*  <IconButton*/}
    {/*    source={require('../../assets/icons/SketchButton.png')}*/}
    {/*    style={spotStyles.iconButton}*/}
    {/*  />*/}
    {/*  <IconButton*/}
    {/*    source={require('../../assets/icons/NoteButton.png')}*/}
    {/*    style={spotStyles.iconButton}*/}
    {/*  />*/}
    {/*</View>*/}
    {/*</View>*/}
    {/*</View>*/}
  </View>
)
};
const mapStateToProps = (state) => {
  console.log('MP to P', state)
  return {
    getImages: state.images.imagePaths
  }
};

export default connect(mapStateToProps, null)(PhotosAndSketches);
