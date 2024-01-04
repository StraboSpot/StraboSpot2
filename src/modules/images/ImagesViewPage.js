import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, Platform, Switch, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Button, Card, Icon, Image} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import {getImageMetaFromWeb, getSize, resizeFile} from './imageHelpers';
import placeholderImage from '../../assets/images/noimage.jpg';
import useUploadHook from '../../services/useUpload';
import commonStyles from '../../shared/common.styles';
import {getNewId, isEmpty} from '../../shared/Helpers';
import ButtonRounded from '../../shared/ui/ButtonRounded';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {setLoadingStatus} from '../home/home.slice';
import {imageStyles, useImagesHook} from '../images';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotImages} from '../spots/spots.slice';

const ImagesViewPage = () => {
  console.log('Rendering ImagesViewPage...');

  const inputRef = useRef(null);

  const useImages = useImagesHook();
  const navigation = useNavigation();
  const toast = useToast();
  const useUpload = useUploadHook();

  const dispatch = useDispatch();
  const images = useSelector(state => state.spot.selectedSpot.properties.images);
  const spot = useSelector(state => state.spot.selectedSpot);

  const [imageThumbnails, setImageThumbnails] = useState({});
  const [isError, setIsError] = useState(false);
  const [isImageLoadedObj, setIsImageLoadedObj] = useState({});

  useEffect(() => {
    console.log('UE ImagesViewPage [images]', images);
    getImageThumbnailURIs().catch(err => console.error('Error getting thumbnails', err));
  }, [images]);

  const importImages = async () => {
    let res;
    dispatch(setLoadingStatus({view: 'home', bool: true}));
    if (Platform.OS !== 'web') {
      res = await useImages.getImagesFromCameraRoll();
      console.log(res);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toast.show(`${res} image saved!`,
        {
          type: 'success',
          duration: 1500,
        });
    }
    else {
      console.log('Import from web');
      await inputRef.current.click();
    }

  };

  const clickedFileInput = () => {
    window.addEventListener('focus', handleFocusBack);
  };

  const handleFocusBack = () => {
    console.log('focus-back');
    dispatch(setLoadingStatus({view: 'home', bool: false}));
    window.removeEventListener('focus', handleFocusBack);
  };

  const handleFileChange = async (e) => {
    dispatch(setLoadingStatus({view: 'home', bool: true}));

    console.log('Target', e.target.value);
    let imageToUpload = e.target.files[0];
    const imageId = getNewId();

    if (e.target.files.length === 0) {
      console.log('No File Selected');
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
    else {
      const metaData = await getImageMetaFromWeb(e.target.files[0]);
      console.log('MetaData', metaData);

      if (metaData.fileSize > 3000000) {
        console.log('Target BEFORE resizing', e.target.files[0]);
        const before = getSize(e.target.files[0]);
        console.log('Target size BEFORE resizing', before);

        // setSelectedImageFile(e.target.files[0]);
        imageToUpload = await resizeFile(e.target.files[0], metaData.height, metaData.width);
        const after = getSize(imageToUpload);
        console.log('Target AFTER resizing', e.target.files[0]);
        console.log('Target size AFTER resizing', after);
      }
      const imageObj = {
        id: imageId,
        height: metaData.height,
        width: metaData.width,
      };
      const res = await useUpload.uploadFromWeb(imageId, imageToUpload);
      console.log(res);
      dispatch(updatedModifiedTimestampsBySpotsIds([spot.properties.id]));
      dispatch(editedSpotImages([imageObj]));
      dispatch(setLoadingStatus({view: 'home', bool: false}));
    }
  };

  const getImageThumbnailURIs = async () => {
    try {
      if (images) {
        const imageThumbnailURIsTemp = await useImages.getImageThumbnailURIs([spot]);
        setIsImageLoadedObj(Object.assign({}, ...Object.keys(imageThumbnailURIsTemp).map(key => ({[key]: false}))));
        setImageThumbnails(imageThumbnailURIsTemp);
        setIsError(false);
      }
    }
    catch (err) {
      console.error('Error in getImageThumbnailURIs', err);
      setIsError(true);
    }
  };

  const takePhoto = async () => {
    const imagesSavedLength = await useImages.launchCameraFromNotebook();
    imagesSavedLength > 0 && toast.show(
      imagesSavedLength + ' photo' + (imagesSavedLength === 1 ? '' : 's') + ' saved',
      {
        type: 'success',
        duration: 1000,
      })
    ;
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
          onPress={() => useImages.editImage(image)}
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
            onValueChange={isAnnotated => useImages.setAnnotation(image, isAnnotated)}
            value={image.annotated}
          />
        </View>
        <Button
          type={'clear'}
          onPress={() => useImages.getImageBasemap(image)}
          title={'View as Image Basemap'}
          disabled={!image.annotated}
          disabledTitleStyle={{color: 'white'}}
          titleStyle={commonStyles.standardButtonText}/>
      </Card>
    );
  };

  const renderImages = () => {
    return (
      <View style={{flex: 1}}>
        <ReturnToOverviewButton/>
        <View style={{alignItems: 'center', flex: 1}}>
          <View style={imageStyles.buttonsContainer}>
            {Platform.OS !== 'web' && <ButtonRounded
              icon={
                <Icon
                  name={'camera-outline'}
                  type={'ionicon'}
                  iconStyle={imageStyles.icon}
                  color={commonStyles.iconColor.color}/>
              }
              title={'Take'}
              titleStyle={commonStyles.standardButtonText}
              buttonStyle={imageStyles.buttonContainer}
              type={'outline'}
              onPress={takePhoto}
            />}
            {Platform.OS === 'web' && <input
              style={{display: 'none'}}
              id={'selectedImage'}
              ref={inputRef}
              type={'file'}
              name={'image'}
              accept={'image/*'}
              onChange={handleFileChange}
              onClick={clickedFileInput}
            />
            }
            <ButtonRounded
              icon={
                <Icon
                  name={'images-outline'}
                  type={'ionicon'}
                  iconStyle={imageStyles.icon}
                  color={commonStyles.iconColor.color}/>
              }
              title={'Import'}
              titleStyle={commonStyles.standardButtonText}
              buttonStyle={imageStyles.buttonContainer}
              type={'outline'}
              onPress={() => importImages()}
            />
            {Platform.OS !== 'web' && <ButtonRounded
              icon={
                <Icon
                  name={'images-outline'}
                  type={'ionicon'}
                  iconStyle={imageStyles.icon}
                  color={commonStyles.iconColor.color}/>
              }
              title={'Sketch'}
              titleStyle={commonStyles.standardButtonText}
              buttonStyle={imageStyles.buttonContainer}
              type={'outline'}
              onPress={() => navigation.navigate('Sketch')}
            />}
          </View>
          <View style={{padding: 5, flex: 1}}>
            <FlatList
              data={images}
              renderItem={({item}) => renderImage(item)}
              numColumns={2}
              ListEmptyComponent={<ListEmptyText text={'No Images'}/>}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      {isError ? renderError() : renderImages()}
    </View>
  );
};

export default ImagesViewPage;
