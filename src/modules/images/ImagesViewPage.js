import React from 'react';
import {FlatList, Image, Text, View} from 'react-native';

import {Button, Card, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import StandardButton from '../../shared/ui/ButtonRounded';
import {imageStyles, useImagesHook} from '../images';
import {NotebookPages, notebookReducers} from '../notebook-panel/notebook.constants';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';

const ImagesViewPage = (props) => {

  const [useImages] = useImagesHook();
  const dispatch = useDispatch();
  const images = useSelector(state => state.spot.selectedSpot.properties.images);

  const renderImages = (item) => {
    console.log('Image Item', item);
    const imageSrc = useImages.getLocalImageSrc(item.id);
    console.log('Image Src', imageSrc);
    return (
      <View style={{flexDirection: 'column', flex: 1}}>
        <Card containerStyle={{}}>
          <Card.Title style={{fontSize: 12}}>{item.title ?? item.id}</Card.Title>
          <Card.Image
            source={{uri: imageSrc}}
            style={{justifyContent: 'center', alignItems: 'center', height: 100}}
            onPress={() => useImages.editImage(item)}
          />
        </Card>
      </View>
    );
  };

  return (
    <React.Fragment>
      <ReturnToOverviewButton
        onPress={() => dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: NotebookPages.OVERVIEW})}
      />
      <View style={imageStyles.buttonContainer}>
        <StandardButton
          title={'Take'}
          type={'outline'}
          onPress={() => props.onPress('takePhoto')}
        />
        <StandardButton
          title={'Import'}
          type={'outline'}
          onPress={() => props.onPress('importPhoto')}

        />
      </View>
      <View style={{flex: 1}}>
        {images && <FlatList data={images} renderItem={({item}) => renderImages(item)} numColumns={2}/>}
      </View>
    </React.Fragment>
  );
};

export default ImagesViewPage;
