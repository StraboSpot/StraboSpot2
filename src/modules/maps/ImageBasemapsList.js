import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Platform, Text, View} from 'react-native';

import {Image} from 'react-native-elements';

import placeholderImage from '../../assets/images/noimage.jpg';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {imageStyles, useImagesHook} from '../images';
import useSpotsHook from '../spots/useSpots';

const ImageBasemapsList = ({closeManMenuPanel}) => {
  console.log('Rendering ImageBasemaps...');

  const useSpots = useSpotsHook();
  const useImages = useImagesHook();

  const [isImageLoadedObj, setIsImageLoadedObj] = useState({});

  const imageBasemaps = useMemo(() => {
    console.log('UM ImageBasemaps []');
    const gotImageBasemaps = useSpots.getImageBasemaps();
    console.log('Image Basemaps:', gotImageBasemaps);
    return gotImageBasemaps;
  }, []);

  useEffect(() => {
    console.log('UE ImageBasemaps []');
    setIsImageLoadedObj(Object.assign({}, ...imageBasemaps.map(b => ({[b.id]: false}))));
  }, []);

  const handleImagePressed = (image) => {
    closeManMenuPanel();
    useImages.getImageBasemap(image);
  };

  const renderImageBasemapThumbnail = (image) => {
    const uri = Platform.OS === 'web' ? useImages.getImageThumbnailURI(image.id)
      : useImages.getLocalImageURI(image.id);
    return (
      <View style={imageStyles.thumbnailContainer}>
        <Text>{image.title}</Text>
        <Image
          source={{uri: uri}}
          style={imageStyles.thumbnail}
          resizeMode={'contain'}
          PlaceholderContent={isEmpty(isImageLoadedObj) || !isImageLoadedObj[image.id] ? <ActivityIndicator/>
            : <Image style={imageStyles.thumbnail} source={placeholderImage}/>}
          placeholderStyle={commonStyles.imagePlaceholder}
          onPress={() => handleImagePressed(image)}
          onError={() => {
            if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(i => ({...i, [image.id]: true}));
          }}
          onLoadEnd={() => {
            if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(i => ({...i, [image.id]: true}));
          }}
        />
      </View>
    );
  };

  return (
    <View style={imageStyles.galleryImageContainer}>
      <FlatList
        keyExtractor={item => item.id.toString()}
        data={imageBasemaps}
        numColumns={3}
        renderItem={({item}) => renderImageBasemapThumbnail(item)}
        ListEmptyComponent={<ListEmptyText text={'No Image Basemaps in Active Datasets'}/>}
      />
    </View>
  );
};

export default ImageBasemapsList;
