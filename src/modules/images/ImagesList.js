import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Platform, Text, View} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import KeyboardManager from 'react-native-keyboard-manager';

import ImageCard from './ImageCard';
import {ImageModal, useImages} from './index';
import commonStyles from '../../shared/common.styles';
import ListEmptyText from '../../shared/ui/ListEmptyText';

const ImagesList = ({deleteImage, images, isOnReport = false, saveImages, saveUpdatedImage}) => {

  const [imageThumbnails, setImageThumbnails] = useState({});
  const [imageToView, setImageToView] = useState({});
  const [isError, setIsError] = useState(false);
  const [isImageLoadedObj, setIsImageLoadedObj] = useState({});
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const {getImageThumbnailURIs} = useImages();

  const onFocusEffect = useCallback(() => {
    if (Platform.OS === 'ios') {
      KeyboardManager.setEnable(true);
    }
    return () => {
      if (Platform.OS === 'ios') {
        console.log('BasicPageDetail onFocusEffect');
        KeyboardManager.setEnable(false);
      }
    };
  }, []);

  useFocusEffect(onFocusEffect);

  useEffect(() => {
    console.log('UE ImagesList [images]', images);
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

  const renderImageCard = (image, index) => {
    return (
      <ImageCard
        image={image}
        imageThumbnails={imageThumbnails}
        index={index}
        isImageLoadedObj={isImageLoadedObj}
        isOnReport={isOnReport}
        setImageToView={setImageToView}
        setIsImageLoadedObj={setIsImageLoadedObj}
        setIsImageModalVisible={setIsImageModalVisible}
      />
    );
  };

  const renderImages = () => {
    const sortedImages = JSON.parse(JSON.stringify(images)).sort(
      (imgA, imgB) => (imgA?.title?.toString() || 'UntitledA').localeCompare(imgB?.title?.toString() || 'UntitledB'));  // alphabetize by name
    return (
      <FlatList
        data={sortedImages}
        renderItem={({item, index}) => renderImageCard(item, index)}
        numColumns={2}
        ListEmptyComponent={<ListEmptyText text={'No Images'}/>}
      />
    );
  };

  return (
    <>
      <View style={{padding: 5, flex: 1}}>
        {isError ? renderError() : renderImages()}
      </View>
      {isImageModalVisible && (
        <ImageModal
          deleteImage={deleteImage}
          image={imageToView}
          saveImages={saveImages}
          saveUpdatedImage={saveUpdatedImage}
          setImageToView={setImageToView}
          setIsImageModalVisible={setIsImageModalVisible}
        />
      )}
    </>
  );
};

export default ImagesList;
