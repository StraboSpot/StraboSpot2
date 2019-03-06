import React, {Component} from 'react';
import {ActivityIndicator, ScrollView, Text, View} from 'react-native';
import {Image} from 'react-native-elements';
import styles from './NotebookPanel.styles';
import IconButton from '../../ui/IconButton';

const PhotosAndSketches = props => (
  <View >
    <View>
      <Text style={props.style}>{props.photosAndSketches}</Text>
    </View>
    <View style={styles.imageContainer}>
      <View>
      <Image
        source={{uri: 'http://www.geosci.usyd.edu.au/users/prey/FieldTrips/Yass04/Images/index_image.jpg'}}
        style={{width: 150, height: 150}}
        PlaceholderContent={<ActivityIndicator />}
        containerStyle={{marginRight: 40}}
      />
      <View style={[styles.imageContainer, {marginLeft: 25, paddingVertical: 5, marginRight: 20}]}>
        <IconButton
          source={require('../../assets/icons/SetBaseMapButton.png')}
          style={styles.iconButton}
        />
        <IconButton
          source={require('../../assets/icons/SketchButton.png')}
          style={styles.iconButton}
        />
        <IconButton
          source={require('../../assets/icons/NoteButton.png')}
          style={styles.iconButton}
        />
      </View>
      </View>
      <View>
      <Image
        source={{uri: 'https://f4.bcbits.com/img/a0561741859_10.jpg'}}
        style={{width: 125, height: 150}}
        PlaceholderContent={<ActivityIndicator />}
      />
        <View style={[styles.imageContainer, {marginLeft: 25, paddingVertical: 5, marginRight: -20}]}>
          <IconButton
            source={require('../../assets/icons/SetBaseMapButton.png')}
            style={styles.iconButton}
          />
          <IconButton
            source={require('../../assets/icons/SketchButton.png')}
            style={styles.iconButton}
          />
          <IconButton
            source={require('../../assets/icons/NoteButton.png')}
            style={styles.iconButton}
          />
        </View>
      </View>
    </View>
  </View>
);

export default PhotosAndSketches;
