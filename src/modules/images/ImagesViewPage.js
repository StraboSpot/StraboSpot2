import React, {useRef} from 'react';
import {FlatList, Switch, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Button, Card, Icon} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import ButtonRounded from '../../shared/ui/ButtonRounded';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import ToastPopup from '../../shared/ui/Toast';
import {imageStyles, useImagesHook} from '../images';
import {setCurrentImageBasemap} from '../maps/maps.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';

const ImagesViewPage = () => {
  const navigation = useNavigation();
  const [useImages] = useImagesHook();

  const dispatch = useDispatch();
  const images = useSelector(state => state.spot.selectedSpot.properties.images);

  const toastRef = useRef(null);

  const takePhoto = async () => {
    const imagesSavedLength = await useImages.launchCameraFromNotebook();
    imagesSavedLength > 0 && toastRef.current.show(
      imagesSavedLength + ' photo' + (imagesSavedLength === 1 ? '' : 's') + ' saved');
  };

  const renderImage = (image) => {
    return (
      <Card containerStyle={imageStyles.cardContainer}>
        <Card.Title style={{fontSize: 12}}>{image.title ?? image.id}</Card.Title>
        <Card.Image
          resizeMode={'contain'}
          source={{uri: useImages.getLocalImageURI(image.id)}}
          onPress={() => useImages.editImage(image)}
        />

        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', paddingTop: 15}}>
          <Text style={{fontSize: 14, textAlign: 'left'}}>Image as {'\n'}Basemap?</Text>
          <Switch
            style={{height: 20}}
            onValueChange={(annotated) => useImages.setAnnotation(image, annotated)}
            value={image.annotated}
          />
        </View>
        <Button
          type={'clear'}
          onPress={() => dispatch(setCurrentImageBasemap(image))}
          title={'View as Image Basemap'}
          disabled={!image.annotated}
          disabledTitleStyle={{color: 'white'}}
          titleStyle={commonStyles.standardButtonText}/>
      </Card>
    );
  };

  return (
    <View style={{flex: 1}}>
      <ReturnToOverviewButton/>
      <View style={{alignItems: 'center', flex: 1}}>
        <View style={imageStyles.buttonsContainer}>
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
            onPress={() => useImages.getImagesFromCameraRoll()}
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
      <ToastPopup toastRef={toastRef}/>
    </View>
  );
};

export default ImagesViewPage;
