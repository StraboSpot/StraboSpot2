import React from 'react';
import {Alert, FlatList, Text, View} from 'react-native';

import {useDispatch} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as SharedUI from '../../shared/ui/index';
import imageStyles from '../images/images.styles';
import useImagesHook from '../images/useImages';
import attributesStyles from '../main-menu-panel/attributes.styles';
import useSpotsHook from '../spots/useSpots';
import {setCurrentImageBasemap} from './maps.slice';

const ImageBaseMaps = (props) => {
  const dispatch = useDispatch();

  const [useSpots] = useSpotsHook();
  const [useImages] = useImagesHook();

  const handleImagePressed = (image) => {
    console.log('Pressed image basemap:', image);
    useImages.doesImageExist(image.id)
      .then((doesExist) => {
        if (!doesExist) Alert.alert('Missing Image!', 'Unable to find image file on this device.');
        dispatch(setCurrentImageBasemap(image));
      })
      .catch((e) => console.error('Image not found', e));
  };

  const renderImageBasemaps = () => {
    const imageBasemaps = useSpots.getImageBasemaps();
    console.log('Image basemaps:', imageBasemaps);
    return (
      <React.Fragment>
        <View style={imageStyles.galleryImageContainer}>
          <FlatList
            keyExtractor={(item) => item.id.toString()}
            data={imageBasemaps}
            numColumns={3}
            renderItem={({item}) => renderImageBasemapThumbnail(item)}
          />
        </View>
      </React.Fragment>
    );
  };

  const renderImageBasemapThumbnail = (image) => {
    return (
      <View style={attributesStyles.listContainer}>
        <View style={attributesStyles.listHeading}>
          <Text style={[attributesStyles.headingText]}>
            {image.title}
          </Text>
        </View>
        <View style={imageStyles.thumbnailContainer}>
          <SharedUI.ImageButton
            source={{uri: useImages.getLocalImageURI(image.id)}}
            style={imageStyles.thumbnail}
            onPress={() => handleImagePressed(image)}
          />
        </View>
      </View>
    );
  };

  const renderNoImageBasemaps = () => {
    return (
      <View style={attributesStyles.textContainer}>
        <Text style={attributesStyles.text}>No Image Basemaps in Active Datasets</Text>
      </View>
    );
  };

  return (
    <React.Fragment>
      {isEmpty(useSpots.getImageBasemaps()) ? renderNoImageBasemaps() : renderImageBasemaps()}
    </React.Fragment>
  );
};

export default ImageBaseMaps;
