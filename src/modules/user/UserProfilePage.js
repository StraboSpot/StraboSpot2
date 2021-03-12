import React, {useEffect, useState} from 'react';
import {Text, View, TextInput} from 'react-native';

import {Avatar, Button, Card, Header, Image, Overlay} from 'react-native-elements';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';
import {encode} from 'js-base64';

import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import commonStyles from '../../shared/common.styles';
import * as themes from '../../shared/styles.constants';
import {readDataUrl} from '../../shared/Helpers';
import {setUserData} from './userProfile.slice';

const UserProfile = (props) => {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user);

  const [name, onNameChangeText] = useState(userData.name);
  const [email, onEmailChangeText] = useState(userData.email);
  const [isImageDialogVisible, setImageDialogVisible] = useState(false);
  const [image, setImage] = useState(userData.image);

  useEffect(() => {
    console.log(image);
  }, [image]);

  const launchCameraRoll = async () => {
    launchImageLibrary({}, async response => {
      console.log(response);
      if (response.uri) {
        setImage(response.uri);
      }
      else return require('../../assets/images/noimage.jpg');
    });
  };

  const saveImage = () => {
    dispatch(setUserData({...userData, image: image}));
    setImageDialogVisible(false);
  };

  const ImageModal = () => {
    return (
      <Overlay
        overlayStyle={{borderRadius: 20, padding: 20, width: 300}}
        isVisible={isImageDialogVisible}
        onBackdropPress={() => setImageDialogVisible(!isImageDialogVisible)}
      >
        <View style={{alignItems: 'center'}}>
          <Image
            source={{uri: image}}
            style={{width: 100, height: 100}}
          />
        </View>

        <Button
          containerStyle={commonStyles.buttonContainer}
          buttonStyle={{borderRadius: 10}}
          title={'Gallery'}
          type={'outline'}
          onPress={() => launchCameraRoll()}
        />
        <Button
          containerStyle={commonStyles.buttonContainer}
          buttonStyle={{borderRadius: 10}}
          title={'Camera'}
          type={'outline'}
        />
        <Button
          containerStyle={commonStyles.buttonContainer}
          buttonStyle={{borderRadius: 10}}
          title={'Save'}
          onPress={() => saveImage()}
          // type={'outline'}
        />
      </Overlay>
    );
  };

  return (
    <View style={{flex: 1}}>
      <SidePanelHeader
        title={'Active Project'}
        headerTitle={'User Profile'}
        backButton={() => dispatch(setSidePanelVisible({bool: false}))}
      />
      <Card containerStyle={{alignItems: 'center'}}>
        <Avatar
          size={'xlarge'}
          onPress={() => console.log('Works!')}
          activeOpacity={0.7}
          renderPlaceholderContent={<Text>NN</Text>}
          rounded={true}
          source={{uri: userData.image}}
        >
          <Avatar.Accessory name={'camera-outline'} type={'ionicon'} size={30}
                            onPress={() => setImageDialogVisible(true)}/>
        </Avatar>
        <View style={{marginTop: 15}}>
          <TextInput
            value={name}
            onChangeText={(text) => onNameChangeText(text)}
          />
          <TextInput
            value={email}
            onChangeText={(text) => onEmailChangeText(text)}
          />
        </View>
      </Card>
      {ImageModal()}
    </View>
  );
};

export default UserProfile;
