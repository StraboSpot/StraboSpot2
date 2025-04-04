import React, {useEffect, useState} from 'react';
import {ScrollView, Text, useWindowDimensions, View} from 'react-native';

import {Picker} from '@react-native-picker/picker';
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

const IGNSModal = (
  {
    sampleValues,
    onModalCancel,
    onSavePress,
    selectedFeature,
  },
) => {
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

  const [changeUserCode, setChangeUserCode] = useState(false);
  const [commonFields, setCommonFields] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isOrcidSignInPrompt, setIsOrcidSignInPrompt] = useState(false);
  const [checkSesarAuth, setCheckSesarAuth] = useState(true);
  const [errorView, setErrorView] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // const [subtitle, setSubtitle] = useState();
  const [isUploaded, setIsUploaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [modalPage, setModalPage] = useState('auth');
  const [sampleToUpload, setSampleToUpload] = useState(sampleValues);

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
    setStatusMessage('Authenticating with SESAR...');
    if (route.params?.orcidToken) {
      getSesarToken(route.params?.orcidToken)
        .then((token) => {
          console.log('SESAR TOKEN', token);
          dispatch(setSesarToken(token));
          navigation.setParams({orcidToken: undefined});
        })
        .catch((error) => {
          console.error(error);
          setCheckSesarAuth(false);
          setErrorMessage(error.toString());
          setErrorView(true);
        });
    }
    else sesarAuth().catch(err => console.error('Error logging into SESAR', err));
  }, [route.params]);

  const handleRegisterOnPress = async () => {
    try {
      const res = await uploadSample(sampleToUpload);
      setStatusMessage(res.status);
      setIsUploaded(prevState => true);
      setModalPage('updated')
    }
    catch (err) {
      const errorMessage = err.toString().split(': ');
      const reformattedErrorMessage = errorMessage[1].replace(/^_*(.)|_+(.)/g,
        (s, c, d) => c ? c.toUpperCase() : ' ' + d.toUpperCase());
      console.error(errorMessage);
      setErrorMessage(reformattedErrorMessage);
      setModalPage(null);
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
      const token = await authenticateWithSesar();
      if (token) {
        if (isEmpty(sesar.userCodes) && !sampleToUpload.isOnMySesar) {
          setIsLoading(true);
          await getAndSaveSesarCode(token);
          // setModalPage('changeUserCode')
          setIsLoading(false);
        }
        else {
          if (sampleToUpload.isOnMySesar) {
            setIsLoading(true);
            setModalPage('updated');
            const res = await updateSampleIsSesar(sampleToUpload);
            if (res.status) {
              setIsLoading(false);
              setIsUploaded(true);
              setStatusMessage(res.status);
            }
          }
          else {
            setStatusMessage('This is the the data that will be uploaded to SESAR:');
            setModalPage('content');
          }
        }
      }
      else setModalPage('orcidSignIn');
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      setErrorMessage(error.toString());
      setModalPage('');
    }
  };

  const setPage = () => {
    switch (modalPage) {
      case 'auth':
        return renderSesarAuth();
      case 'changeUserCode':
        return renderUserCodeSelection();
      case 'content':
        return renderUploadContent();
      case 'updated':
        return renderUploadedSample();
      case 'orcidSignIn':
        return renderOrcidSignIn();
      default:
        return renderErrorView();
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
      setErrorView(true);
    }
  };

  const renderErrorView = () => {
    return (
      <View style={IGSNModalStyles.errorContainer}>
        <Text style={IGSNModalStyles.headerText}>There was a error!</Text>
        <Text style={IGSNModalStyles.errorMessageText}>{errorMessage}</Text>
      </View>
    );
  };

  const renderOrcidSignIn = () => {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center', maxHeight: 400}}>
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
              <Button
                title={'Sign into Orcid'}
                onPress={signIntoOrcid}
                buttonStyle={{backgroundColor: 'rgb(78, 114, 33)', paddingHorizontal: 50}}
              />
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

  const renderUserCodeSelection = () => {
    return (
      <View>
        <Picker
          selectedValue={sesar.selectedUserCode}
          onValueChange={(itemValue, itemIndex) => {
            console.log(itemValue, itemIndex);
            dispatch(setSelectedUserCode(itemValue));
          }}
        >
          {sesar.userCodes.map((userCode) => {
              return (
                <Picker.Item
                  key={userCode}
                  label={userCode}
                  value={userCode}
                />
              );
            },
          )}
        </Picker>
        <Button
          title={'Select User Code'}
          onPress={() => setModalPage('content')}
          type={'clear'}
        />
      </View>
    );
  };

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
    const sesarMappedObj = straboSesarMapping(sampleToUpload);
    return (
      <>
        <Text style={IGSNModalStyles.uploadContentDescription}>{statusMessage}</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={IGSNModalStyles.uploadContentText}>User Code: {sesar.selectedUserCode}</Text>
          {!sampleToUpload.isOnMySesar && (
            <Button
              containerStyle={{marginLeft: 10}}
              type={'outline'}
              titleStyle={{fontWeight: 'bold', fontSize: 12}}
              title={'Switch User'}
              onPress={() => setModalPage('changeUserCode')}
            />
          )}
        </View>
        {sesarMappedObj.map((item) => {
          if (item.sesarKey === 'user_code') return null;
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
    console.log('SAMPLE', sampleToUpload.sample_id_name);
    return (
      <>
        {!isEmpty(sampleToUpload.sample_id_name) && (
          <ScrollView>
            <View style={{marginLeft: 30}}>
              <View style={{alignItems: 'flex-start'}}>
                {renderContentItems()}
              </View>
            </View>
          </ScrollView>
        )
          //   : (
          //   <View style={{padding: 20, marginVertical: 20}}>
          //     <Text style={{fontSize: 18, textAlign: 'center'}}>{statusMessage}</Text>
          //   </View>
          // )
        }
      </>
    );
  };

  const renderUploadedSample = () => {
    return (
      <View style={{padding: 20, marginVertical: 20}}>
        <Text style={{fontSize: 18, textAlign: 'center'}}>{statusMessage}</Text>
      </View>
    );
  };

  return (
    <Overlay
      overlayStyle={SMALL_SCREEN ? overlayStyles.overlayContainerFullScreen : {
        ...overlayStyles.overlayContainer,
        maxHeight: height * 0.80, width: 500,
      }}
    >
      <Button
        title={'X'}
        type={'clear'}
        titleStyle={{color: 'black'}}
        containerStyle={{alignItems: 'flex-end'}}
        onPress={onModalCancel}
      />

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
        {!sampleToUpload.isOnMySesar && modalPage === 'content' && !isUploaded
          && (
            <Button
              onPress={handleRegisterOnPress}
              title={'Register Sample'}
              containerStyle={{padding: 10}}
              buttonStyle={{backgroundColor: 'black', padding: 10}}
            />
          )}
      </View>
      <Loading isLoading={isLoading} style={{backgroundColor: 'transparent'}}/>
    </Overlay>
  );
};

export default IGNSModal;
