import React from 'react';
import {ActivityIndicator, Button, FlatList, View} from 'react-native';
import {connect} from 'react-redux';
import {withNavigation} from 'react-navigation';

import {Image} from 'react-native-elements';
import {setForm} from '../form/form.container';

// Constants
import {spotReducers} from '../../spots/Spot.constants';

// Hooks
import useImagesHook from './useImages';

// Styles
import imageStyles from './images.styles';

const imageNotebook = (props) => {
  const [useImages] = useImagesHook();

  const editImage = (image) => {
    props.setSelectedAttributes([image]);
    setForm('images');
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
    <FlatList
      data={props.images}
      renderItem={({item}) => renderImage(item)}
      keyExtractor={(item) => item.id.toString()}
    />
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(imageNotebook));
