import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Switch, Text, View} from 'react-native';

import {Button, Card, Icon, Image} from 'react-native-elements';

import {imageStyles, useImages} from './index';
import placeholderImage from '../../assets/images/noimage.jpg';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';

const ImagesList = ({images}) => {

  const [imageThumbnails, setImageThumbnails] = useState({});
  const [isError, setIsError] = useState(false);
  const [isImageLoadedObj, setIsImageLoadedObj] = useState({});

  const {editImage, getImageBasemap, getImageThumbnailURIs, setAnnotation} = useImages();

  useEffect(() => {
    console.log('UE ImagesPage [images]', images);
    loadImageThumbnailURIs().catch(err => console.error('Error getting thumbnails', err));
  }, [images]);

  const loadImageThumbnailURIs = async () => {
    try {
      if (images.length > 0) {
        const imageThumbnailURIsTemp = await getImageThumbnailURIs(images);
        setIsImageLoadedObj(Object.assign({}, ...Object.keys(imageThumbnailURIsTemp).map(key => ({[key]: false}))));
        setImageThumbnails(imageThumbnailURIsTemp);
        setIsError(false);
      }
    }
    catch (err) {
      console.error('Error getting image thumbnail URIs', err);
      setIsError(true);
    }
  };

  const renderError = () => (
    <View style={{paddingTop: 75}}>
      <Icon name={'alert-circle-outline'} type={'ionicon'} size={100}/>
      <Text style={[commonStyles.noValueText, {paddingTop: 50}]}>Problem getting thumbnail images...</Text>
    </View>
  );

  const renderImage = (image) => {
    return (
      <Card containerStyle={imageStyles.cardContainer}>
        <Card.Title style={{fontSize: 12}}>{image.title ?? image.id}</Card.Title>
        <Card.Image
          resizeMode={'contain'}
          source={imageThumbnails[image.id] ? {uri: imageThumbnails[image.id]} : placeholderImage}
          onPress={() => editImage(image)}
          PlaceholderContent={isEmpty(isImageLoadedObj) || !isImageLoadedObj[image.id] ? <ActivityIndicator/>
            : <Image style={imageStyles.thumbnail} source={placeholderImage}/>}
          placeholderStyle={commonStyles.imagePlaceholder}
          onError={() => {
            if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(i => ({...i, [image.id]: true}));
          }}
          onLoadEnd={() => {
            if (!isImageLoadedObj[image.id]) setIsImageLoadedObj(i => ({...i, [image.id]: true}));
          }}
        />

        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', paddingTop: 15}}>
          <Text style={{fontSize: 14, textAlign: 'left'}}>Image as {'\n'}Basemap?</Text>
          <Switch
            style={{height: 20}}
            onValueChange={isAnnotated => setAnnotation(image, isAnnotated)}
            value={image.annotated}
          />
        </View>
        <Button
          type={'clear'}
          onPress={() => getImageBasemap(image)}
          title={'View as Image Basemap'}
          disabled={!image.annotated}
          disabledTitleStyle={{color: 'white'}}
          titleStyle={commonStyles.standardButtonText}/>
      </Card>
    );
  };

  const renderImages = () => {
    return (
      <FlatList
        data={images}
        renderItem={({item}) => renderImage(item)}
        numColumns={2}
        ListEmptyComponent={<ListEmptyText text={'No Images'}/>}
      />
    );
  };

  return (
    <View style={{padding: 5, flex: 1}}>
      {isError ? renderError() : renderImages()}
    </View>
  );
};

export default ImagesList;
