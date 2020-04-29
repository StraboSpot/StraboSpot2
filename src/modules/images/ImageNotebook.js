import React from 'react';
import {ActivityIndicator, Button, Dimensions, FlatList, ScrollView, View} from 'react-native';

import {connect} from 'react-redux';
import {withNavigation} from 'react-navigation';
import {Image} from 'react-native-elements';

// Hooks
import useImagesHook from './useImages';

// Constants
import {spotReducers} from '../spots/spot.constants';

// Styles
import imageStyles from './images.styles';

const screenHeight = Dimensions.get('window').height;

const ImageNotebook = (props) => {
  const [useImages] = useImagesHook();

  const editImage = (image) => {
    props.setSelectedAttributes([image]);
    props.navigation.navigate('ImageInfo', {imageId: image.id});
  };

  const renderImage = (image) => {
    // console.log('IMAGE', image);
    return (
      <View style={imageStyles.imageContainer}>
        <Image
          source={{uri: useImages.getLocalImageSrc(image.id)}}
          style={imageStyles.notebookImage}
          PlaceholderContent={<ActivityIndicator/>}
        />
        <Button
          title={'Edit'}
          onPress={() => editImage(image)}
          style={imageStyles.editButton}
        />
      </View>
    );
  };

  return (
    <ScrollView style={{maxHeight: screenHeight - 300}}>
      <FlatList
        data={props.images}
        renderItem={({item}) => renderImage(item)}
        keyExtractor={(item) => item.id.toString()}
      />
    </ScrollView>
  );
};

const mapStateToProps = (state) => {
  return {
    images: state.spot.selectedSpot.properties.images,
  };
};

const mapDispatchToProps = {
  setSelectedAttributes: (attributes) => ({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: attributes}),
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ImageNotebook));
