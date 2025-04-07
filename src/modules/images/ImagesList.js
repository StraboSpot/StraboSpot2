import React, {useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {Icon} from 'react-native-elements';

import ImageCard from './ImageCard';
import {ImageModal, useImages} from './index';
import commonStyles from '../../shared/common.styles';
import ListEmptyText from '../../shared/ui/ListEmptyText';

const ImagesList = ({deleteImage, images, saveImages, saveUpdatedImage}) => {

  const [imageThumbnails, setImageThumbnails] = useState({});
  const [imageToView, setImageToView] = useState({});
  const [isError, setIsError] = useState(false);
  const [isImageLoadedObj, setIsImageLoadedObj] = useState({});
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const {getImageThumbnailURIs} = useImages();

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
        setImageToView={setImageToView}
        setIsImageLoadedObj={setIsImageLoadedObj}
        setIsImageModalVisible={setIsImageModalVisible}
      />
    );
  };

  const renderImages = () => {
    const sortedImages = JSON.parse(JSON.stringify(images)).sort(
      (titleA, titleB) => (titleA?.title || 'Untitled').localeCompare(titleB?.title || 'Untitled'));  // alphabetize by name}
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
