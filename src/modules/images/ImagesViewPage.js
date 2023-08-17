import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, Platform, Switch, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Button, Card, Icon, Image} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import placeholderImage from '../../assets/images/noimage.jpg';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import ButtonRounded from '../../shared/ui/ButtonRounded';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {imageStyles, useImagesHook} from '../images';
import {setCurrentImageBasemap} from '../maps/maps.slice';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {clearedSelectedSpots} from '../spots/spots.slice';
import useSpotsHook from '../spots/useSpots';
import ImagesImport from './ImagesImport';
import useImportImagesHook from './useImportImages';

const ImagesViewPage = () => {
  console.log('Rendering ImagesViewPage...');

  const navigation = useNavigation();
  const [useImages] = useImagesHook();
  const useImportImages = useImportImagesHook();
  const [useSpots] = useSpotsHook();
  const toast = useToast();

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

  // const getImagesFromCameraRoll = async () => {
  //   dispatch(setLoadingStatus({view: 'home', bool: true}));
  //     const res = await useImages.getImagesFromCameraRoll();
  //     console.log(res);
  //     dispatch(setLoadingStatus({view: 'home', bool: false}));
  //     toast.show(`${res} image saved!`,
  //       {
  //         type: 'success',
  //         duration: 1500,
  //       });
  //     console.log(res);
  // };

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

  // const listAcceptedFiles = async (item) => {
  //   console.log('FILES', item);
  //   const image = await useImages.listAcceptedFiles(item);
  //   return (
  //     <ListItem>
  //       <Text>{image.path} - {image.size} bytes</Text>
  //     </ListItem>
  //   );
  // };
  //
  // const listRejectedFiles = (item) => {
  //   console.log('FILES', item);
  //   return (
  //     <ListItem>
  //       <Text>{item.file.path} - {item.file.size} bytes</Text>
  //     </ListItem>
  //   );
  // };

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

  const handleGetImages = async (e) => {
    let res;
    if (Platform.OS !== 'web') {
      res = await useImportImages.getImages();
      console.log(res);
      toast.show(`${res} image saved!`,
        {
          type: 'success',
          duration: 1500,
        });
    }
    else {
      useImportImages.openDialog();
      console.log('IMAGE FILE FROM WEB', res);

    }
    // dispatch(setLoadingStatus({view: 'home', bool: false}));

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
          onPress={() => handleImageBasemapPressed(image)}
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
            {Platform.OS !== 'web' && (
              <ButtonRounded
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
              />
            )}
            <ImagesImport
              handleGetImages={() => handleGetImages()}
              imageFile={imageObj => useImportImages.uploadImages(imageObj)}
            />
            <ButtonRounded
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
            />
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
    <React.Fragment>
      {isError ? renderError() : renderImages()}
    </React.Fragment>
  );
};

export default ImagesViewPage;
