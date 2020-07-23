import React from 'react';
import {ActivityIndicator, Button, Dimensions, FlatList, ScrollView, Text, View} from 'react-native';

import {Image} from 'react-native-elements';
import {withNavigation} from 'react-navigation';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {spotReducers} from '../spots/spot.constants';
import imageStyles from './images.styles';
import useImagesHook from './useImages';

const screenHeight = Dimensions.get('window').height;

const ImageNotebook = (props) => {
  const [useImages] = useImagesHook();
  const dispatch = useDispatch();
  const images = useSelector(state => state.spot.selectedSpot.properties.images);

  const editImage = (image) => {
    dispatch({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: [image]});
    props.navigation.navigate('ImageInfo', {imageId: image.id});
  };

  const renderImage = (image) => {
    // console.log('IMAGE', image);
    return (
      <View>
        <View style={imageStyles.imageContainer}>
          <Image
            source={{uri: useImages.getLocalImageSrc(image.id)}}
            style={imageStyles.notebookImage}
            PlaceholderContent={<ActivityIndicator/>}
          />
          <View style={{
            flexDirection: 'column',
          }}>
            <Text style={[commonStyles.dialogContent,{textAlign:'left'}]}>Image title : {image.title}</Text>
            <Text style={[commonStyles.dialogContent,{textAlign:'left'}]}>{(image.annotated) ? 'Image Basemap' : ''}</Text>
          </View>
          <Button
            title={'Edit'}
            onPress={() => editImage(image)}
            style={imageStyles.editButton}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={{maxHeight: screenHeight - 300}}>
      {images ? <FlatList
        data={images}
        renderItem={({item}) => renderImage(item)}
        keyExtractor={(item) => item.id.toString()}
      /> : <Text style={commonStyles.noValueText}>No Images</Text>}
    </ScrollView>
  );
};

export default withNavigation(ImageNotebook);
