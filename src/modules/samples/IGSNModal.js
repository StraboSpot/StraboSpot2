import React, {useEffect, useState, forwardRef} from 'react';
import {ScrollView, Text, useWindowDimensions, View} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';
import moment from 'moment';
import {Button, Overlay, Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import IGSNModalStyles from './IGSNModal.styles';
import useSamples from './useSamples';
import OrcidLogo from '../../assets/images/logos/orcid_logo.png';
import SesarLogo from '../../assets/images/logos/sesar2_logo.png';
import useServerRequests from '../../services/useServerRequests';
import {isEmpty, truncateText} from '../../shared/Helpers';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import Loading from '../../shared/ui/Loading';
import overlayStyles from '../home/overlays/overlay.styles';
import {setSelectedUserCode, setSesarToken, updatedKey} from '../user/userProfile.slice';

const IGNSModal = forwardRef(({
                                sampleValues,
                                onModalCancel,
                                onSampleSaved,
                              }, formRef) => {
  const {height} = useWindowDimensions();

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const {
    authenticateWithSesar,
    getAndSaveSesarCode,
    straboSesarMapping,
    updateSampleIsSesar,
    uploadSample,
  } = useSamples();
  const {encoded_login, sesar} = useSelector(state => state.user);

  const {getSesarToken, getOrcidToken} = useServerRequests();

  const [commonFields, setCommonFields] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isOrcidSignInPrompt, setIsOrcidSignInPrompt] = useState(false);
  const [checkSesarAuth, setCheckSesarAuth] = useState(true);
  const [errorView, setErrorView] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploaded, setIsUploaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [modalPage, setModalPage] = useState('content');

  useEffect(() => {
    if (!sesar) {
      dispatch(updatedKey({
        sesar: {
          selectedUserCode: '',
          userCodes: [],
          sesarToken: {
            access: '',
            refresh: '',
          },
        },
      }));
    }
  }, []);

  useEffect(() => {
    if (route.params?.orcidToken) {
      getSesarToken(route.params?.orcidToken)
        .then((token) => {
          console.log('SESAR TOKEN', token);
          dispatch(setSesarToken(token));
          navigation.setParams({orcidToken: undefined});
          setModalPage('content');
        })
        .catch((error) => {
          console.error(error);
          setCheckSesarAuth(false);
          setErrorMessage(error.toString());
          setModalPage('error');
        });
    }
    else sesarAuth().catch(err => console.error('Error logging into SESAR', err));
  }, [route.params]);

  const handleConfirmOnPress = () => {
    onSampleSaved(formRef.current);
    onModalCancel();
  };

  const registerSample = async () => {
    try {
      let res;
      const sesarUserCode = !formRef.current.values.isOnMySesar ? sesar.selectedUserCode : formRef.current.values.sesarUserCode;
      await formRef.current.setValues({...formRef.current.values, sesarUserCode: sesarUserCode});
      console.log('Updated FormRef', formRef.current.values);
      setIsLoading(true);
      if (formRef.current.values.isOnMySesar) {
        setStatusMessage('Updating Sample...');
        console.log('UPDATING SESAR');
        res = await updateSampleIsSesar(formRef.current.values);
        setIsUploaded(true);
      }
      else {
        setStatusMessage('Uploading Sample...');
        res = await uploadSample(formRef.current.values);
        setIsUploaded(true);
      }
      setStatusMessage(res.status);
      await formRef.current.setValues({...formRef.current.values, Sample_IGSN: res.igsn, isOnMySesar: true});
      console.log('Updated FormRef', formRef.current.values);

    }
    catch (err) {
      const errorMessage = err.toString().split(': ');
      const reformattedErrorMessage = errorMessage[1].replace(/^_*(.)|_+(.)/g,
        (s, c, d) => c ? c.toUpperCase() : ' ' + d.toUpperCase());
      console.error(errorMessage);
      setErrorMessage(reformattedErrorMessage);
      setModalPage('error');
      setIsUploaded(false);
    }
  };

  const isoToLocalDateTime = (isoString, type) => {
    const date = new Date(isoString);
    const timeAndDate = type === 'time' ? date.toLocaleTimeString('en-US') : date.toLocaleDateString('en-US');
    return timeAndDate;
  };

  const sesarAuth = async () => {
    try {
      setModalPage('content');
      console.log('SESAR AUTH');
      setStatusMessage('Authenticating with SESAR...');
      const token = await authenticateWithSesar();
      if (token) {
        if (isEmpty(sesar.userCodes) && !formRef.current.values.isOnMySesar) {
          setIsLoading(true);
          await getAndSaveSesarCode(token);
        }
        await registerSample();
      }
      else setModalPage('orcidSignIn');
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      setErrorMessage(error.toString());
      setModalPage('error');
    }
  };

  const setPage = () => {
    switch (modalPage) {
      case 'error':
        return renderErrorView('error');
      case 'content':
        return renderUploadContent();
      case 'orcidSignIn':
        return renderOrcidSignIn();
      default:
        return renderSesarAuth();
    }
  };

  const signIntoOrcid = async () => {
    try {
      setIsLoading(true);
      await getOrcidToken(encoded_login);
      setIsOrcidSignInPrompt(false);
      setIsLoading(false);
    }
    catch (error) {
      console.error(error.toString());
      setErrorMessage(error.toString());
      setModalPage('error');
    }
  };

  const renderErrorView = () => {
    return (
      <View style={IGSNModalStyles.errorContainer}>
        <Text style={IGSNModalStyles.headerText}>There was a error!</Text>
        <Text style={IGSNModalStyles.errorMessageText}>{errorMessage}</Text>
        <Button
          title={'Ok'}
          onPress={onModalCancel}
          buttonStyle={{backgroundColor: 'rgb(78, 114, 33)', paddingHorizontal: 50}}
        />
      </View>
    );
  };

  const renderOrcidSignIn = () => {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center', maxHeight: 400}}>
        <Button
          title={'X'}
          type={'clear'}
          titleStyle={{color: 'black'}}
          containerStyle={{alignItems: 'flex-end'}}
          onPress={onModalCancel}
        />
        <Image
          source={OrcidLogo}
          style={{height: 60, width: 200}}
        />
        {isLoading
          ? (
            <Text style={{fontSize: 18, textAlign: 'center', fontWeight: 'bold', padding: 20}}>
              Checking ORCID Credentials...
            </Text>
          )
          : (
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{textAlign: 'center', padding: 20, fontSize: 18, fontWeight: 'bold'}}>
                Please sign into your ORCID account to continue.
              </Text>
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              <Button
                title={'Sign into Orcid'}
                onPress={signIntoOrcid}
                buttonStyle={{backgroundColor: 'rgb(78, 114, 33)', paddingHorizontal: 50}}
              />
              <Button
                title={'Cancel'}
                onPress={onModalCancel}
                buttonStyle={{backgroundColor: 'rgb(78, 114, 33)', paddingHorizontal: 50}}
              />
              </View>
            </View>
          )
        }
      </View>
    );
  };

  const renderSesarAuth = () => {
    return (
      <>
        <Text style={IGSNModalStyles.sesarAuthText}>{statusMessage}</Text>
      </>
    );
  };

  // const renderUserCodeSelection = () => {
  //   return (
  //     <View>
  //       <Picker
  //         selectedValue={sesar.selectedUserCode}
  //         onValueChange={(itemValue, itemIndex) => {
  //           console.log(itemValue, itemIndex);
  //           dispatch(setSelectedUserCode(itemValue));
  //         }}
  //       >
  //         {sesar.userCodes.map((userCode) => {
  //             return (
  //               <Picker.Item
  //                 key={userCode}
  //                 label={userCode}
  //                 value={userCode}
  //               />
  //             );
  //           },
  //         )}
  //       </Picker>
  //       <Button
  //         title={'Select User Code'}
  //         onPress={() => setModalPage('content')}
  //         type={'clear'}
  //       />
  //     </View>
  //   );
  // };

  const formatContentItems = (item) => {
    if (item.sesarKey === 'longitude' || item.sesarKey === 'latitude') {
      return item.value.toFixed(5);
    }
    if (item.sesarKey === 'collection_start_date') {
      return moment(item.value).format('MM-DD-YYYY (h:mm:ss a)');
      // return isoToLocalDateTime(item.value);
    }
    if (item.sesarKey === 'collection_time') {
      return isoToLocalDateTime(item.value, 'time');
    }
    if (item.sesarKey === 'description') return truncateText(item.value, 30);
    else return item.value;
  };

  const renderContentItems = () => {
    const sesarMappedObj = straboSesarMapping(formRef.current.values);
    return (
      <>
        <Text style={IGSNModalStyles.uploadContentDescription}>{statusMessage}</Text>
        {isUploaded && sesarMappedObj.map((item) => {
          return (
            <View key={item.sesarKey}
                  style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={IGSNModalStyles.uploadContentText}>{item.label}</Text>
              <Text style={IGSNModalStyles.fieldValueText}> {formatContentItems(item)}</Text>
            </View>
          );
        })
        }
      </>
    );
  };

  const renderUploadContent = () => {
    console.log('RENDER CONTENT', modalPage);
    console.log('SAMPLE', formRef.current.values.sample_id_name);
    return (
      <>
        {!isEmpty(formRef.current.values.sample_id_name) && (
          <ScrollView>
            <View style={{marginLeft: 30}}>
              <View style={{alignItems: 'flex-start'}}>
                {renderContentItems()}
              </View>
            </View>
          </ScrollView>
        )}
      </>
    );
  };

  return (
    <Overlay
      overlayStyle={SMALL_SCREEN ? overlayStyles.overlayContainerFullScreen : {
        ...overlayStyles.overlayContainer,
        maxHeight: height * 0.80, width: 500,
      }}
      animationType={'fade'}
    >
      <View style={IGSNModalStyles.container}>
        <View style={IGSNModalStyles.sesarImageContainer}>
          {modalPage !== 'orcidSignIn'
            && (
              <Image
                source={SesarLogo}
                style={IGSNModalStyles.sesarImage}
              />
            )}
        </View>
        {setPage()}
      </View>
      <View style={overlayStyles.buttonContainer}>
        {(modalPage === 'content' && isUploaded)
          && (
            <Button
              onPress={handleConfirmOnPress}
              title={'Ok'}
              containerStyle={{padding: 10}}
              buttonStyle={{backgroundColor: 'black', padding: 10}}
            />
          )}
      </View>
      <Loading isLoading={isLoading} style={{backgroundColor: 'transparent'}}/>
    </Overlay>
  );
});

export default IGNSModal;
