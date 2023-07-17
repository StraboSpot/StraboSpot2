import React, {useLayoutEffect, useRef, useState} from 'react';
import {Animated, Image, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Formik} from 'formik';
import {Base64} from 'js-base64';
import {Avatar, Button, Icon, Overlay} from 'react-native-elements';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequestsHook from '../../services/useServerRequests';
import useUploadHook from '../../services/useUpload';
import {REDUX} from '../../shared/app.constants';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import TextInputModal from '../../shared/ui/GeneralTextInputModal';
import {Form} from '../form';
import useFormHook from '../form/useForm';
import {addedStatusMessage, clearedStatusMessages, setErrorMessagesModalVisible} from '../home/home.slice';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import userStyles from './user.styles';
import {setUserData} from './userProfile.slice';

const UserProfile = (props) => {
  const formRef = useRef(null);
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user);
  const isOnline = useSelector(state => state.home.isOnline);

  const [avatar, setAvatar] = useState(userData.image);
  const [isImageDialogVisible, setImageDialogVisible] = useState(false);
  const [isDeleteProfileModalVisible, setDeleteProfileModalVisible] = useState(false);
  const [deleteProfileInputValue, setDeleteProfileInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [useForm] = useFormHook();
  const navigation = useNavigation();
  const toast = useToast();
  const useUpload = useUploadHook();
  const [useServerRequest] = useServerRequestsHook();

  const formName = ['general', 'user_profile'];

  const deleteModalText
    = <View><Text style={userStyles.deleteProfileText}>Deleting your profile will
    <Text style={commonStyles.dialogContentImportantText}> PERMANENTLY {'\n'} </Text>
    remove any personal info and data saved for user{'\n'}{userData.email}{'\n'} from www.Strabospot.org!
  </Text>
    <Text style={userStyles.deleteProfileText}>Enter password to delete:</Text>
  </View>;

  const offlineText = <Text style={userStyles.deleteProfileText}>Need to be online in order to delete profile.</Text>;

  useLayoutEffect(() => {
    console.log('UE UserProfile []');
    return () => saveForm();
  }, []);

  const deleteProfile = async () => {
    console.log(deleteProfileInputValue);
    if (!isEmpty(deleteProfileInputValue)) {
      const isAuthenticated = await useServerRequest.authenticateUser(userData.email, deleteProfileInputValue);
      if (isAuthenticated.valid === 'true') {
        const encodedLogin = Base64.encode(`${userData.email}:${deleteProfileInputValue}`);
        console.log(encodedLogin);
        const res = await useServerRequest.deleteProfile(encodedLogin);
        console.log('PROFILE DELETED!', res);
        setDeleteProfileModalVisible(false);
        dispatch({type: REDUX.CLEAR_STORE});
        toast.show('Profile Successfully Deleted!', {type: 'success', duration: 2000})
        setTimeout(() => navigation.navigate('SignIn'), 200)
      }
      else setErrorMessage('Wrong password');
    }
    else setErrorMessage('Need to enter your password');
  };

  const deleteProfileModal = () => {
    return (
      <TextInputModal
        topPosition={10}
        dialogTitle={'DANGER!'}
        overlayTitleText={{color: 'red'}}
        buttonText={'DELETE'}
        overlayButtonText={{color: 'red'}}
        visible={isDeleteProfileModalVisible}
        onPress={deleteProfile}
        close={() => setDeleteProfileModalVisible(false)}
        textAboveInput={isOnline.isInternetReachable ? deleteModalText : offlineText}
        onChangeText={text => handleOnChange(text)}
        errorMessage={errorMessage}
        onSubmitEditing={deleteProfile}
      />
    );
  };

  const handleOnChange = (text) => {
    if (!isEmpty(errorMessage)) setErrorMessage('');
    setDeleteProfileInputValue(text);
  };

  const pickImageSource = async (source) => {
    if (source === 'gallery') {
      launchImageLibrary({}, async (response) => {
        console.log('Profile Image', response);
        if (response.didCancel) return;
        if (response) setAvatar(response.assets[0]);
        else return require('../../assets/images/noimage.jpg');
      });
    }
    else {
      launchCamera({}, (response) => {
        console.log('Response = ', response);
        if (response.didCancel) return;
        if (response) setAvatar(response.assets[0]);
        else return require('../../assets/images/noimage.jpg');
      });
    }
  };

  const saveForm = async () => {
    const formCurrent = formRef.current;
    if (formCurrent.dirty) {
      await formRef.current.submitForm();
      let newValues = JSON.parse(JSON.stringify(formCurrent.values));
      console.log(newValues);
      if (useForm.hasErrors(formCurrent)) {
        console.log(formCurrent.hasErrors());
      }
      dispatch(setUserData(newValues));
      if (isOnline.isInternetReachable) upload(newValues).catch(err => console.error('Error:', err));
      else props.toast('Not connected to internet to upload profile changes', 'noWifi');
    }
   else toast.show('No changes were made.')
  };

  const saveImage = async () => {
    try {
      const imageProps = {width: avatar.width, height: avatar.height};
      const uri = avatar.uri;
      const resizedProfileImage = await useUpload.resizeImageForUpload(imageProps, uri, 'profileImage');
      console.log('RESIZED PROFILE IMAGE', resizedProfileImage);
      formRef.current.setFieldValue('image', resizedProfileImage.uri);
      dispatch(setUserData({...userData, image: resizedProfileImage.uri}));
      setImageDialogVisible(false);
    }
    catch (err) {
      console.error(err);
      setImageDialogVisible(false);
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Error saving image profile...' + err));
      dispatch(setErrorMessagesModalVisible(true));
    }
  };

  const ImageModal = () => {
    return (
      <Overlay
        overlayStyle={userStyles.imageSelectionModal}
        isVisible={isImageDialogVisible}
      >
        <View style={{alignItems: 'flex-end'}}>
          <Icon
            name={'close-outline'}
            type={'ionicon'}
            onPress={() => setImageDialogVisible(!isImageDialogVisible)}
          />
        </View>
        <View style={{alignItems: 'center'}}>
          <Avatar
            rounded
            renderPlaceholderContent={<Image source={require('../../assets/images/noimage.jpg')}
                                             style={{width: '70%', height: '70%'}}/>}
            source={{uri: avatar?.uri || avatar}}
            size={'xlarge'}
          />
        </View>
        <Button
          containerStyle={commonStyles.buttonContainer}
          buttonStyle={{borderRadius: 10}}
          title={'Gallery'}
          type={'outline'}
          onPress={() => pickImageSource('gallery')}
        />
        <Button
          containerStyle={commonStyles.buttonContainer}
          buttonStyle={{borderRadius: 10}}
          title={'Camera'}
          type={'outline'}
          onPress={() => pickImageSource('camera')}
        />
        <Button
          containerStyle={commonStyles.buttonContainer}
          buttonStyle={{borderRadius: 10}}
          title={'Save'}
          onPress={() => saveImage()}
        />
      </Overlay>
    );
  };

  const upload = async (values) => {
    try {
      console.log(values);
      await useUpload.uploadProfile(values);
      toast.show('Profile uploaded successfully!', {type: 'success'});
    }
    catch (err) {
      console.error('Error uploading profile', err);
      toast.show('Profile uploaded UN-successfully...', {type: 'danger'});
    }
  };

  return (
    <View style={{flex: 1}}>
      <SidePanelHeader
        title={'My Strabo Spot'}
        headerTitle={'Profile'}
        backButton={() => dispatch(setSidePanelVisible({bool: false}))}
      />
      <Animated.View style={{flex: 1}}>
        <View style={{alignItems: 'center', marginTop: 15}}>
          <Avatar
            containerStyle={userStyles.avatarLabelContainer}
            avatarStyle={userStyles.profilePageAvatarContainer}
            size={200}
            rounded={true}
            renderPlaceholderContent={<Image source={require('../../assets/images/noimage.jpg')}
                                             style={{width: '70%', height: '70%'}}/>}
            source={!isEmpty(userData.image) && {uri: userData.image}}
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
            onSubmit={values => console.log('Submitting form...', values)}
            validate={values => useForm.validateForm({formName: formName, values: values})}
            component={formProps => Form({formName: formName, ...formProps})}
            initialValues={userData}
            validateOnChange={true}
            enableReinitialize={false}  // Update values if preferences change while form open, like when number incremented
          />
        </View>
        <Button
          title={'DELETE PROFILE'}
          type={'clear'}
          onPress={() => setDeleteProfileModalVisible(true)}
          containerStyle={userStyles.deleteProfileButtonContainer}
          titleStyle={userStyles.deleteProfileButtonText}
        />
        {ImageModal()}
        {deleteProfileModal()}
        {<TextInputModal/>}
      </Animated.View>
    </View>
  );
};

export default UserProfile;
