import React, {useRef, useState} from 'react';
import {Animated, Image, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Formik} from 'formik';
import {Base64} from 'js-base64';
import {Avatar, Button, Icon, Overlay} from 'react-native-elements';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import userStyles from './user.styles';
import {setUserData} from './userProfile.slice';
import useResetStateHook from '../../services/useResetState';
import useServerRequestsHook from '../../services/useServerRequests';
import useUploadHook from '../../services/useUpload';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import alert from '../../shared/ui/alert';
import TextInputModal from '../../shared/ui/TextInputModal';
import {Form} from '../form';
import useFormHook from '../form/useForm';
import {addedStatusMessage, clearedStatusMessages, setIsErrorMessagesModalVisible} from '../home/home.slice';
import overlayStyles from '../home/overlays/overlay.styles';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';

const UserProfilePage = () => {
  const formRef = useRef(null);

  const dispatch = useDispatch();
  const isOnline = useSelector(state => state.connections.isOnline);
  const userData = useSelector(state => state.user);

  const [avatar, setAvatar] = useState(userData.image);
  const [deleteProfileInputValue, setDeleteProfileInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleteProfileModalVisible, setDeleteProfileModalVisible] = useState(false);
  const [isImageDialogVisible, setImageDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);

  const navigation = useNavigation();
  const toast = useToast();
  const useForm = useFormHook();
  const useResetState = useResetStateHook();
  const useServerRequest = useServerRequestsHook();
  const useUpload = useUploadHook();

  const formName = ['general', 'user_profile'];

  const deleteModalText
    = <View><Text style={userStyles.deleteProfileText}>Deleting your profile will
    <Text style={overlayStyles.importantText}> PERMANENTLY {'\n'} </Text>
    remove any personal info and data saved for user{'\n'}{userData.email}{'\n'} from www.Strabospot.org!
  </Text>
    <Text style={userStyles.deleteProfileText}>Enter password to delete:</Text>
  </View>;

  const offlineText = <Text style={userStyles.deleteProfileText}>Need to be online in order to delete profile.</Text>;

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
        useResetState.clearUser();
        toast.show('Profile Successfully Deleted!', {type: 'success', duration: 2000});
        setTimeout(() => navigation.navigate('SignIn'), 200);
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
        overlayTitleText={overlayStyles.importantText}
        buttonText={'DELETE'}
        overlayButtonText={overlayStyles.importantText}
        visible={isDeleteProfileModalVisible}
        onPress={deleteProfile}
        closeModal={() => setDeleteProfileModalVisible(false)}
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
      await launchImageLibrary({}, async (response) => {
        console.log('Profile Image', response);
        if (response.didCancel) return;
        if (response) setAvatar(response.assets[0]);
        else return require('../../assets/images/noimage.jpg');
      });
    }
    else {
      await launchCamera({}, (response) => {
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
      setIsLoading(true);
      await formRef.current.submitForm();
      let newValues = JSON.parse(JSON.stringify(formCurrent.values));
      console.log(newValues);
      if (useForm.hasErrors(formCurrent)) {
        console.log(formCurrent.hasErrors());
      }
      dispatch(setUserData(newValues));
      if (isOnline.isInternetReachable) {
        await upload(newValues).catch(err => console.error('Error:', err));
        toast.show('Profile uploaded successfully!', {type: 'success'});
        setIsLoading(false);
        dispatch(setSidePanelVisible({bool: false}));
      }
      else toast.show('Not connected to internet to upload profile changes', {type: 'warning'});
    }
    else {
      setSaveButtonDisabled(true);
      toast.show('No changes were made.');
    }
  };

  const saveImage = async () => {
    try {
      const imageProps = {width: avatar.width, height: avatar.height, uri: avatar.uri};
      const resizedProfileImage = await useUpload.resizeProfileImageForUpload(imageProps);
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
      dispatch(setIsErrorMessagesModalVisible(true));
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
            renderPlaceholderContent={
              <Image
                source={require('../../assets/images/noimage.jpg')}
                style={{width: '70%', height: '70%'}}
              />
            }
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
    }
    catch (err) {
      console.error('Error uploading profile', err);
      toast.show('Profile uploaded UN-successfully...', {type: 'danger'});
    }
  };

  const validateForm = (values) => {
    console.log('DIRTY', formRef.current.dirty);
    if (saveButtonDisabled) setSaveButtonDisabled(false);
    useForm.validateForm({formName: formName, values: values});
    console.log('DIRTY AFTER', formRef.current.dirty);

  };

  return (
    <View style={{flex: 1}}>
      <SidePanelHeader
        title={'My Strabo Spot'}
        headerTitle={'Profile'}
        backButton={() => {
          console.log('DIRTY', formRef.current.dirty);
          if (!formRef?.current?.dirty) {
            toast.show('No Changes Were Made.');
            dispatch(setSidePanelVisible({bool: false}));
          }
          else {
            alert(
              'Changes Were Made',
              'Do you want to save your Changes',
              [
                {text: 'Ok', onPress: async () => await saveForm()},
                {text: 'Cancel', onPress: () => dispatch(setSidePanelVisible({bool: false}))},
              ],
            );
          }
        }}
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
          >
            <View style={{position: 'relative', right: 15, bottom: 15}}>
              <Avatar.Accessory
                reverse
                name={'pencil'}
                type={'font-awesome'}
                size={23}
                iconStyle={{color: 'white'}}
                color={'grey'}
                onPress={() => setImageDialogVisible(true)}
              />
            </View>
          </Avatar>
        </View>
        <View style={{flex: 1}}>
          <Formik
            innerRef={formRef}
            onSubmit={values => console.log('Submitting form...', values)}
            validate={values => validateForm(values)}
            component={formProps => Form({formName: formName, ...formProps})}
            initialValues={userData}
            validateOnChange={true}
            enableReinitialize={false}  // Update values if preferences change while form open, like when number incremented
          />
          <View style={userStyles.saveButtonContainer}>
            <Button
              onPress={() => saveForm()}
              type={'clear'}
              title={'Save Changes'}
              disabled={saveButtonDisabled}
              loading={isLoading}
              loadingProps={userStyles.loadingSpinnerProps}
            />
          </View>
        </View>
        <View style={commonStyles.buttonContainer}>
          <Text>Need to be online to delete profile.</Text>
          <Button
            title={'DELETE PROFILE'}
            disabled={!isOnline.isInternetReachable}
            type={'clear'}
            onPress={() => setDeleteProfileModalVisible(true)}
            containerStyle={userStyles.deleteProfileButtonContainer}
            titleStyle={userStyles.deleteProfileButtonText}
          />
        </View>
        {ImageModal()}
        {deleteProfileModal()}
      </Animated.View>
    </View>
  );
};

export default UserProfilePage;
