import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Switch, Text, View} from 'react-native';

import {Button, Image} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {imageStyles, useImages} from '.';
import commonStyles from '../../shared/common.styles';
import {isEmpty, truncateText} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import overlayStyles from '../home/overlays/overlay.styles';

const placeholderImage = require('../../assets/images/noimage.jpg');

const ImagesOverview = () => {
  console.log('Rendering ImagesOverview...');

  const {editImage, getImageBasemap, getImageThumbnailURIs, setAnnotation} = useImages();

  const images = useSelector(state => state.spot.selectedSpot.properties.images);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [imageThumbnails, setImageThumbnails] = useState({});
  const [isImageLoadedObj, setIsImageLoadedObj] = useState({});

  useEffect(() => {
    console.log('UE ImagesOverview []');
    loadImageThumbnailURIs().catch(err => console.error(err));
  }, [spot]);

  const loadImageThumbnailURIs = async () => {
    try {
      if (images) {
        const imageThumbnailURIsTemp = await getImageThumbnailURIs([spot]);
        setIsImageLoadedObj(Object.assign({}, ...Object.keys(imageThumbnailURIsTemp).map(key => ({[key]: false}))));
        if (!isEmpty(imageThumbnailURIsTemp)) setImageThumbnails(imageThumbnailURIsTemp);
      }
    }
    catch (err) {
      console.error('Error getting image thumbnail URIs', err);
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
            onPress={() => editImage(image)}
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
                  onPress={() => getImageBasemap(image)}
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
                onValueChange={annotated => setAnnotation(image, annotated)}
                value={image.annotated}
              />
              <Text style={{textAlign: 'left', paddingLeft: 5}}>Use as Image Basemap?</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={images}
      renderItem={({item}) => renderImage(item)}
      keyExtractor={item => item.id.toString()}
      ListEmptyComponent={<ListEmptyText text={'No Images'}/>}
    />
  );
};

export default ImagesOverview;
