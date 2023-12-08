import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator,  FlatList, Platform, Text, View} from 'react-native';

import {Image} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import {setCurrentImageBasemap} from './maps.slice';
import placeholderImage from '../../assets/images/noimage.jpg';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import alert from '../../shared/ui/alert';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import imageStyles from '../images/images.styles';
import useImagesHook from '../images/useImages';
import {clearedSelectedSpots} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';

const ImageBasemaps = () => {
  console.log('Rendering ImageBasemaps...');

  const dispatch = useDispatch();

  const [useSpots] = useSpotsHook();
  const [useImages] = useImagesHook();

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
          else alert('Missing Image!', 'Unable to find image file on this device.');
        })
        .catch(e => console.error('Image not found', e));
    }
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
    <React.Fragment>
      <View style={imageStyles.galleryImageContainer}>
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={imageBasemaps}
          numColumns={3}
          renderItem={({item}) => renderImageBasemapThumbnail(item)}
          ListEmptyComponent={<ListEmptyText text={'No Image Basemaps in Active Datasets'}/>}
        />
      </View>
    </React.Fragment>
  );
};

export default ImageBasemaps;
