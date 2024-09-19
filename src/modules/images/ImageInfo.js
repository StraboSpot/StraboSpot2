import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Platform, Text, useWindowDimensions, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Image} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import {ImagePropertiesModal, imageStyles, useImagesHook} from '.';
import placeholderImage from '../../assets/images/noimage.jpg';
import commonStyles from '../../shared/common.styles';
import IconButton from '../../shared/ui/IconButton';
import {WarningModal} from '../home/modals';
import overlayStyles from '../home/overlays/overlay.styles';
import {useSpots} from '../spots';
import {setSelectedAttributes} from '../spots/spots.slice';

const ImageInfo = ({route}) => {
  console.log('Rendering ImageInfo...');

  const {width, height} = useWindowDimensions();

  const dispatch = useDispatch();
  const [isImagePropertiesModalVisible, setIsImagePropertiesModalVisible] = useState(false);
  const [imageData, setImageData] = useState({});
  const useImages = useImagesHook();
  const {getSpotByImageId} = useSpots();
  const navigation = useNavigation();

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageDeleteModalVisible, setIsImageDeleteModalVisible] = useState(false);

  useEffect(() => {
    console.log('UE ImageInfo []');
    setImageData(route.params.imageInfo);
    return () => dispatch(setSelectedAttributes([]));
  }, []);

  const clickHandler = (name) => {
    console.log(name);
    switch (name) {
      case 'sketch':
        navigation.navigate('Sketch', {imageInfo: imageData});
        break;
    }
  };

  const handleDeleteImageOnPress = () => {
    setIsImageDeleteModalVisible(true);
  };

  const closeModal = () => {
    setIsImagePropertiesModalVisible(false);
  };

  const deleteImage = async () => {
    setIsImageDeleteModalVisible(false);
    const isImageDeleted = await useImages.deleteImage(imageData.id, getSpotByImageId(imageData.id));
    if (isImageDeleted) navigation.goBack();
  };

  const renderDeleteImageModal = () => {
    return (
      <WarningModal
        title={'Delete Image?'}
        isVisible={isImageDeleteModalVisible}
        closeModal={() => setIsImageDeleteModalVisible(false)}
        confirmText={'Delete'}
        showConfirmButton
        showCancelButton
        confirmTitleStyle={overlayStyles.importantText}
        onConfirmPress={() => deleteImage()}
      >
        <Text>Are you sure you want to delete image:{'\n'}</Text>
        <Text>{imageData.id}</Text>
      </WarningModal>
    );
  };

  return (
    <View style={{backgroundColor: 'black', justifyContent: 'center', alignContent: 'center'}}>
      <Image
        source={Platform.OS === 'web' ? {uri: useImages.getImageScreenSizedURI(imageData.id)}
          : {uri: useImages.getLocalImageURI(imageData.id)}}
        style={Platform.OS === 'web' ? {width: width, height: height}
          : {width: '100%', height: '100%'}}
        resizeMode={'contain'}
        PlaceholderContent={!isImageLoaded ? <ActivityIndicator/>
          : <Image style={imageStyles.thumbnail} source={placeholderImage}/>}
        placeholderStyle={commonStyles.imagePlaceholder}
        onError={() => {
          if (!isImageLoaded) setIsImageLoaded(true);
        }}
        onLoadEnd={() => {
          if (!isImageLoaded) setIsImageLoaded(true);
        }}
      />
      {isImagePropertiesModalVisible && (
        <ImagePropertiesModal
          closeModal={() => closeModal()} // Saves and closes modal
          cancel={() => closeModal()} // Closes without saving
        />
      )}
      <View style={imageStyles.closeButtonContainer}>
        <IconButton
          source={require('../../assets/icons/Close.png')}
          onPress={() => navigation.goBack()}
          style={imageStyles.closeButtonStyle}
        />
      </View>
      <View style={imageStyles.rightsideIcons}>
        <IconButton
          style={imageStyles.imageInfoButtons}
          source={require('../../assets/icons/ImagePropertiesButton.png')}
          onPress={() => setIsImagePropertiesModalVisible(true)}
        />
        {Platform.OS !== 'web' && (
          <IconButton
            style={imageStyles.imageInfoButtons}
            source={require('../../assets/icons/ImageSketchButton.png')}
            onPress={() => clickHandler('sketch')}
          />
        )}
        <IconButton
          style={imageStyles.imageInfoButtons}
          source={require('../../assets/icons/DeleteButton.png')}
          onPress={() => handleDeleteImageOnPress()}
        />
        {renderDeleteImageModal()}
      </View>
    </View>
  );
};

export default ImageInfo;
