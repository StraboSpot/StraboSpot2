import React from 'react';
import {ActivityIndicator, Button, Dimensions, FlatList, ScrollView, Switch, Text, View} from 'react-native';

import {connect, useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {truncateText} from '../../shared/Helpers';
import * as SharedUI from '../../shared/ui/index';
import {mapReducers} from '../maps/maps.constants';
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

  const setAnnotated = (image, annotation) => {
    image.annotated = annotation;
    if (annotation && !image.title) image.title = image.id;
    dispatch({type: spotReducers.SET_SELECTED_ATTRIBUTES, attributes: [image]});
    if (!image.annotated) {
      props.updateImageBasemap(undefined);
    }
  };

  const renderImage = (image) => {
    // console.log('IMAGE', image);
    return (
      <View>
        <View style={imageStyles.imageContainer}>
          <SharedUI.ImageButton
            source={{uri: useImages.getLocalImageSrc(image.id)}}
            style={imageStyles.notebookImage}
            PlaceholderContent={<ActivityIndicator/>}
            onPress={() => editImage(image)}
          />
          <View style={{alignSelf: 'flex-start', flexDirection: 'column', flex: 1, paddingLeft: 10}}>
            {image.title
            && <Text
              style={[commonStyles.dialogContent, {textAlign: 'left', textDecorationLine: 'underline'}]}>
              {truncateText(image.title, 20)}
            </Text>}
            <View style={[{alignSelf: 'flex-start'}]}>
              {image.annotated && <Button
                title={'View as Image Basemap'}
                onPress={() => props.updateImageBasemap(image)}
              />}
            </View>
            {image.image_type !== 'sketch' ? <View
              style={{alignSelf: 'flex-start', flexDirection: 'row', flex: 1, paddingLeft: 10, alignItems: 'center'}}>
              <Switch
                onValueChange={(annotated) => setAnnotated(image, annotated)}
                value={image.annotated}
              />
              <Text style={{textAlign: 'left', paddingLeft: 5}}>Image as Image Basemap?</Text>
            </View> : <View
              style={{alignSelf: 'flex-start', flexDirection: 'row', flex: 1, paddingLeft: 10, alignItems: 'center'}}>
              <Text>Id: {image.id}</Text>
            </View>}
          </View>
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

function mapStateToProps(state) {
  return {};
}

const mapDispatchToProps = {
  updateImageBasemap: (currentImageBasemap) => ({
    type: mapReducers.CURRENT_IMAGE_BASEMAP,
    currentImageBasemap: currentImageBasemap,
  }),
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageNotebook);
