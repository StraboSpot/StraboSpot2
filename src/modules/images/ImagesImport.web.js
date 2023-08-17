import React, {createRef, useState} from 'react';
import {Image, Text, View} from 'react-native';

import {Icon, Overlay} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import ButtonRounded from '../../shared/ui/ButtonRounded';
import overlayStyles from '../home/overlay.styles';
import {imageStyles} from './index';
import useImagesHook from './useImages';

const ImagesInput = (props) => {
  const inputRef = createRef();
  const [isImageOverlayVisible, setIsImageOverlayVisible] = useState(false);
  const [imageFile, setImageFile] = useState({});
  const [queryImage, setQueryImage] = useState({});

  const [useImages] = useImagesHook();

  const handleClick = () => {
    // 👇️ open file input box on click of another element
    inputRef.current.click();
  };

  const handleFileChange = async (event) => {

    let fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }

    console.log('fileObj is', fileObj);
    console.log('URL OBJ', URL.createObjectURL(fileObj));
    fileObj.url = URL.createObjectURL(fileObj);
    if (!fileObj.height && !fileObj.width) {
      const {height, width} = await useImages.getImageHeightAndWidth(fileObj.url);
      console.log('Height', height, 'Width', width);
      fileObj.height = height;
      fileObj.width = width;
    }
    // 👇️ reset file input
    event.target.value = null;

    // 👇️ is now empty
    console.log(event.target.files);

    // 👇️ can still access file object here
    console.log('fileObj is', fileObj);
    props.imageFile(fileObj);
    // setImagePath(fileObj);
    // setImageFile(URL.createObjectURL(fileObj));
    // setIsImageOverlayVisible(true);
  };

  return (
    <View>
      <input
        style={{display: 'none'}}
        ref={inputRef}
        type='file'
        onChange={handleFileChange}
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
        onPress={() => handleClick()}/>
      <Overlay
        isVisible={isImageOverlayVisible}
        onBackdropPress={() => setIsImageOverlayVisible(false)}
        style={overlayStyles.overlayContainer}
      >
        <Text style={overlayStyles.titleText}>Selected Image</Text>
        <Image source={imageFile} style={{height: 300, width: 300}}/>
      </Overlay>
    </View>
  );
};

export default ImagesInput;
