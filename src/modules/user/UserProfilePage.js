import React, {useEffect, useRef, useState} from 'react';
import {Text, View, TextInput, Keyboard, Animated} from 'react-native';

import {Formik} from 'formik';
import {encode} from 'js-base64';
import {Avatar, Button, Overlay} from 'react-native-elements';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import * as Helpers from '../../shared/Helpers';
import {Form} from '../form';
import useFormHook from '../form/useForm';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {setUserData} from './userProfile.slice';



const {State: TextInputState} = TextInput;

const UserProfile = (props) => {
  const formName = ['general', 'user_profile'];

  const formRef = useRef(null);
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user);

  const [avatar, setAvatar] = useState(userData.image);
  const [isImageDialogVisible, setImageDialogVisible] = useState(false);
  const [textInputAnimate] = useState(new Animated.Value(0));

  const [useForm] = useFormHook();

  useEffect(() => {
    console.log('useEffect Form []');
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return function cleanup() {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHide);
    };
  }, []);

  useEffect(() => {
    console.log('UE userProfile []');
    console.log('user', userData);
    return () => saveForm();
  }, []);

  const handleKeyboardDidShow = (event) => Helpers.handleKeyboardDidShow(event, TextInputState, textInputAnimate);

  const handleKeyboardDidHide = () => Helpers.handleKeyboardDidHide(textInputAnimate);

  const launchCameraRoll = async () => {
    launchImageLibrary({}, async response => {
      console.log(response);
      if (response.uri) {
        setAvatar(response.uri);
      }
      else return require('../../assets/images/noimage.jpg');
    });
  };

  const saveForm = async () => {
    const formCurrent = formRef.current;
    await formRef.current.submitForm();
    let newValues = JSON.parse(JSON.stringify(formCurrent.values));
    console.log(newValues);
    if (useForm.hasErrors(formCurrent)) {
      console.log(formCurrent.hasErrors());
    }
    dispatch(setUserData(newValues));
  };

  const saveImage = () => {
    dispatch(setUserData({...userData, image: avatar}));
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
          <Avatar
            rounded
            source={{uri: avatar}}
            size={'xlarge'}
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
        title={'My Strabo Spot'}
        headerTitle={'Profile'}
        backButton={() => dispatch(setSidePanelVisible({bool: false}))}
      />
      <Animated.View style={{transform: [{translateY: textInputAnimate}], flex: 1}}>
      <View style={{alignItems: 'center', marginTop: 15}}>
        <Avatar
          containerStyle={{padding: 10}}
          avatarStyle={{borderWidth: 7, borderColor: 'white'}}
          size={200}
          onPress={() => console.log('Works!')}
          activeOpacity={0.7}
          renderPlaceholderContent={<Text>NN</Text>}
          rounded={true}
          source={{uri: userData.image}}
         />
      </View>
      <View>
        <Button
          title={'Edit Profile Photo'}
          titleStyle={commonStyles.standardButtonText}
          type={'clear'}
          onPress={() => setImageDialogVisible(true)}
        />
      </View>
      <View style={{flex: 1}}>
        <Formik
          innerRef={formRef}
          onSubmit={(values) => console.log('Submitting form...', values)}
          validate={(values) => useForm.validateForm({formName: formName, values: values})}
          component={(formProps) => Form({formName: formName, ...formProps})}
          initialValues={userData}
          validateOnChange={true}
          enableReinitialize={true}  // Update values if preferences change while form open, like when number incremented
        />
      </View>

      {ImageModal()}
      </Animated.View>
    </View>
  );
};

export default UserProfile;
