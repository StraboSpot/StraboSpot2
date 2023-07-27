import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, Platform, Switch, Text, View} from 'react-native';

import {Button, Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty, truncateText} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import overlayStyles from '../home/overlay.styles';
import {setCurrentImageBasemap} from '../maps/maps.slice';
import {clearedSelectedSpots} from '../spots/spots.slice';
import imageStyles from './images.styles';
import useImagesHook from './useImages';

const placeholderImage = require('../../assets/images/noimage.jpg');

const ImagesOverview = () => {
  console.log('Rendering ImagesOverview...');

  const [useImages] = useImagesHook();

  const dispatch = useDispatch();
  const images = useSelector(state => state.spot.selectedSpot.properties.images);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [imageThumbnails, setImageThumbnails] = useState({});
  const [isImageLoadedObj, setIsImageLoadedObj] = useState({});

  useEffect(() => {
    console.log('UE ImagesOverview []');
    getImageThumbnailURIs().catch(err => console.error(err));
  }, [spot]);

  const getImageThumbnailURIs = async () => {
    try {
      if (images) {
        const imageThumbnailURIsTemp = await useImages.getImageThumbnailURIs([spot]);
        setIsImageLoadedObj(Object.assign({}, ...Object.keys(imageThumbnailURIsTemp).map(key => ({[key]: false}))));
        if (!isEmpty(imageThumbnailURIsTemp)) setImageThumbnails(imageThumbnailURIsTemp);
      }
    }
    catch (err) {
      console.error('Error in getImageThumbnailURIs', err);
    }
  };

  const handleImageBasemapPressed = (image) => {
    console.log('Pressed image basemap:', image);
    if (Platform.OS === 'web') {
      dispatch(clearedSelectedSpots());
      dispatch(setCurrentImageBasemap(image));
    }
    else {
      useImages.doesImageExistOnDevice(image.id)
        .then((doesExist) => {
          if (doesExist) {
            dispatch(clearedSelectedSpots());
            dispatch(setCurrentImageBasemap(image));
          }
          else Alert.alert('Missing Image!', 'Unable to find image file on this device.');
        })
        .catch(e => console.error('Image not found', e));
    }
  };

  const renderImage = (image) => {
    return (
      <View>
        <View style={imageStyles.imageContainer}>
          <Image
            resizeMode={'contain'}
            source={imageThumbnails[image.id] ? {uri: imageThumbnails[image.id]} : placeholderImage}
            style={imageStyles.notebookImage}
            PlaceholderContent={isEmpty(isImageLoadedObj) || !isImageLoadedObj[image.id] ? <ActivityIndicator/>
              : <Image style={imageStyles.thumbnail} source={placeholderImage}/>}
            placeholderStyle={commonStyles.imagePlaceholder}
            onPress={() => useImages.editImage(image)}
            onError={() => {
              if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(i => ({...i, [image.id]: true}));
            }}
            onLoadEnd={() => {
              if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(i => ({...i, [image.id]: true}));
            }}
          />
          <View style={{alignSelf: 'flex-start', flexDirection: 'column', flex: 1, paddingLeft: 10}}>
            {image.title && (
              <Text
                style={[overlayStyles.overlayContent]}>
                {truncateText(image.title, 20)}
              </Text>
            )}
            <View style={[{alignSelf: 'flex-start'}]}>
              {image.annotated && (
                <Button
                  title={'View as Image Basemap'}
                  type={'clear'}
                  onPress={() => handleImageBasemapPressed(image)}
                />
              )}
            </View>
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                flex: 1,
                paddingLeft: 10,
                alignItems: 'center',
              }}>
              <Switch
                onValueChange={annotated => useImages.setAnnotation(image, annotated)}
                value={image.annotated}
              />
              <Text style={{textAlign: 'left', paddingLeft: 5}}>Use as Image Basemap?</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderImages = () => {
    return (
      <FlatList
        data={images}
        renderItem={({item}) => renderImage(item)}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<ListEmptyText text={'No Images'}/>}
      />
    );
  };

  return (
    <React.Fragment>
      {renderImages()}
    </React.Fragment>
  );
};

export default ImagesOverview;
