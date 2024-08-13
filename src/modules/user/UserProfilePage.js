import React, {useRef, useState} from 'react';
import {Animated, PermissionsAndroid, Platform, Text, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {Formik} from 'formik';
import {Base64} from 'js-base64';
import {Button, Icon, Overlay} from 'react-native-elements';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import userStyles from './user.styles';
import {setUserData} from './userProfile.slice';
import UserProfileAvatar from './UserProfileAvatar';
import {APP_DIRECTORIES} from '../../services/directories.constants';
import useDeviceHook from '../../services/useDevice';
import usePermissionsHook from '../../services/usePermissions';
import useResetStateHook from '../../services/useResetState';
import useServerRequestsHook from '../../services/useServerRequests';
import useUploadHook from '../../services/useUpload';
import useUploadImagesHook from '../../services/useUploadImages';
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

  const [deleteProfileInputValue, setDeleteProfileInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleteProfileModalVisible, setDeleteProfileModalVisible] = useState(false);
  const [isImageDialogVisible, setImageDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
  const [shouldUpdateImage, setShouldUpdateImage] = useState(false);
  const [tempUserProfileImage, setTempUserProfileImage] = useState(null);

  const navigation = useNavigation();
  const toast = useToast();
  const useDevice = useDeviceHook();
  const useForm = useFormHook();
  const usePermissions = usePermissionsHook();
  const useResetState = useResetStateHook();
  const useServerRequest = useServerRequestsHook();
  const useUpload = useUploadHook();
  const useUploadImages = useUploadImagesHook();

  const formName = ['general', 'user_profile'];

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

  const renderDeleteProfileModal = () => {
    const deleteModalText = (
      <View>
        <Text style={userStyles.deleteProfileText}>
          Deleting your profile will<Text style={overlayStyles.importantText}> PERMANENTLY {'\n'} </Text>
          remove any personal info and data saved for user{'\n'}{userData.email}{'\n'} from www.Strabospot.org!
        </Text>
        <Text style={userStyles.deleteProfileText}>Enter password to delete:</Text>
      </View>
    );
    const offlineText = <Text style={userStyles.deleteProfileText}>Need to be online in order to delete profile.</Text>;

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
        console.log('Launch Image Library Response:', response);
        if (response.didCancel) return;
        if (response) setTempUserProfileImage({...response.assets[0], id: 'profileImage'});
        else return require('../../assets/images/noimage.jpg');
      });
    }
    else {
      let permissionGranted;
      console.log(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (Platform.OS === 'android') {
        permissionGranted = await usePermissions.checkPermission(PermissionsAndroid.PERMISSIONS.CAMERA);
      }
      if (permissionGranted === 'granted' || Platform.OS === 'ios') {
        await launchCamera({}, (response) => {
          console.log('Launch Camera Response', response);
          if (response.didCancel) return;
          if (response) setTempUserProfileImage({...response.assets[0], id: 'profileImage'});
          else return require('../../assets/images/noimage.jpg');
        });
      }
    }
  };

  const saveForm = async () => {
    try {
      const formCurrent = formRef.current;
      setIsLoading(true);
      await formRef.current.submitForm();
      let newValues = JSON.parse(JSON.stringify(formCurrent.values));
      if (useForm.hasErrors(formCurrent)) throw Error('Error in form.');
      dispatch(setUserData(newValues));
      if (isOnline.isInternetReachable) {
        await useUpload.uploadProfile(newValues);
        // await upload(newValues);
        toast.show('Profile uploaded successfully!', {type: 'success'});
        setIsLoading(false);
        dispatch(setSidePanelVisible({bool: false}));
      }
      else toast.show('Not connected to internet to upload profile changes', {type: 'warning'});
      setIsSaveButtonDisabled(true);
    }
    catch (err) {
      console.error('Error uploading profile', err);
      toast.show('Error uploading profile', {type: 'danger'});
      setIsLoading(false);
    }
  };

  const saveImage = async () => {
    try {
      console.log('Need to upload', tempUserProfileImage.uri);
      const resizedProfileImage = await useUploadImages.resizeImageForUpload(tempUserProfileImage, tempUserProfileImage.uri);
      await useDevice.copyFiles(resizedProfileImage.uri, 'file://' + APP_DIRECTORIES.PROFILE_IMAGE);
      await useDevice.deleteFromDevice(resizedProfileImage.uri);
      await useUploadImages.uploadProfileImage('file://' + APP_DIRECTORIES.PROFILE_IMAGE);
      setShouldUpdateImage(true);
      closeProfileImageModal();
      toast.show('Profile image uploaded successfully!', {type: 'success'});
    }
    catch (err) {
      console.error('Error saving new profile image:', err);
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Error uploading profile image: ' + err));
      dispatch(setIsErrorMessagesModalVisible(true));
      closeProfileImageModal();
    }
  };

  const closeProfileImageModal = () => {
    setImageDialogVisible(false);
    setTempUserProfileImage(null);
  };

  const openProfileImageModal = () => {
    setShouldUpdateImage(false);
    setImageDialogVisible(true);
  };

  const renderProfileImageModal = () => {
    return (
      <Overlay
        overlayStyle={userStyles.imageSelectionModal}
        isVisible={isImageDialogVisible}
      >
        <View style={{alignItems: 'flex-end'}}>
          <Icon
            name={'close-outline'}
            type={'ionicon'}
            onPress={closeProfileImageModal}
          />
        </View>
        <View style={{alignItems: 'center'}}>
          <UserProfileAvatar size={'xlarge'} tempUserProfileImageURI={tempUserProfileImage?.uri}/>
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
          disabled={isEmpty(tempUserProfileImage)}
          buttonStyle={{borderRadius: 10}}
          title={'Upload New Profile Image'}
          onPress={saveImage}
        />
      </Overlay>
    );
  };

  const validateForm = (values) => {
    console.log('DIRTY', formRef.current.dirty);
    useForm.validateForm({formName: formName, values: values});
    console.log('DIRTY AFTER', formRef.current.dirty);
    if (formRef.current.dirty || formRef.current.touched?.image) setIsSaveButtonDisabled(false);
  };

  return (
    <View style={{flex: 1}}>
      <SidePanelHeader
        title={'My Strabo Spot'}
        headerTitle={'Profile'}
        backButton={() => {
          console.log('Is User Profile page dirty?', formRef.current.dirty);
          if (!formRef?.current?.dirty) dispatch(setSidePanelVisible({bool: false}));
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
      <Animated.View style={{flex: 1}} pointerEvents={isOnline.isInternetReachable ? 'auto' : 'none'}>
        <View style={{alignItems: 'center', marginTop: 15}}>
          <UserProfileAvatar
            isEditable={true}
            openProfileImageModal={openProfileImageModal}
            shouldUpdateImage={shouldUpdateImage}
            size={200}
          />
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
            disabled={true}
          />
          {isOnline.isInternetReachable ? (
            <View style={userStyles.saveButtonContainer}>
              <Button
                onPress={() => saveForm()}
                type={'clear'}
                title={'Upload Profile Changes'}
                disabled={isSaveButtonDisabled}
                loading={isLoading}
                loadingProps={userStyles.loadingSpinnerProps}
              />
              <View style={commonStyles.buttonContainer}>
                <Button
                  title={'DELETE PROFILE'}
                  type={'clear'}
                  onPress={() => setDeleteProfileModalVisible(true)}
                  containerStyle={userStyles.deleteProfileButtonContainer}
                  titleStyle={userStyles.deleteProfileButtonText}
                />
              </View>
            </View>
          ) : (
            <Text style={commonStyles.noValueText}>Must be online to save changes to profile or delete profile.</Text>
          )}
        </View>
        {renderProfileImageModal()}
        {renderDeleteProfileModal()}
      </Animated.View>
    </View>
  );
};

export default UserProfilePage;
