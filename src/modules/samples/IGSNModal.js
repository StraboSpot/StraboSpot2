import React, {useEffect, useState} from 'react';
import {ScrollView, Text, useWindowDimensions, View} from 'react-native';

import {Picker} from '@react-native-picker/picker';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Button, Overlay, Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useSamples from './useSamples';
import useForm from '../../modules/form/useForm';
import useServerRequests from '../../services/useServerRequests';
import {isEmpty} from '../../shared/Helpers';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import Loading from '../../shared/ui/Loading';
import overlayStyles from '../home/overlays/overlay.styles';
import {setSelectedUserCode} from '../user/userProfile.slice';

const IGNSModal = (
  {
    sampleValues,
    onModalCancel,
    onSavePress,
    selectedFeature,
  },
) => {
  const formName = ['general', 'samples'];
  const {height} = useWindowDimensions();
  const {
    registerSample,
  } = useSamples(selectedFeature);

  const navigation = useNavigation();
  const route = useRoute();

  const {getLabel} = useForm();
  const {authenticateWithSesar} = useSamples(selectedFeature);
  const {getSesarToken, getOrcidToken} = useServerRequests();

  // const formValues = formRef?.values;
  const dispatch = useDispatch();
  const {name, encoded_login, sesar} = useSelector(state => state.user);

  const [changeUserCode, setChangeUserCode] = useState(false);
  const [commonFields, setCommonFields] = useState({
    sampleType: getLabel(sampleValues.values.sample_type, formName),
    materialType: getLabel(sampleValues.values.material_type, formName),
    collector: name,
    collectionDate: sampleValues.values.collection_date,
    description: sampleValues.values.description || '',
    latitude: sampleValues.values.latitude,
    longitude: sampleValues.values.longitude,
    samplingPurpose: sampleValues.values.main_sampling_purpose,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOrcidSignInPrompt, setIsOrcidSignInPrompt] = useState(false);
  const [checkSesarAuth, setCheckSesarAuth] = useState(true);
  const [errorView, setErrorView] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    if (route.params?.orcidToken) {
      getSesarToken(route.params?.orcidToken)
        .then((token) => {
          console.log('SESAR TOKEN', token);
          navigation.setParams({orcidToken: undefined});
        })
        .catch(error => console.error(error));
    }
    else sesarAuth().catch(err => console.error('Error logging into SESAR', err));
  }, [route.params]);

  const isoToLocalDateTime = (isoString, type) => {
    const date = new Date(isoString);
    const timeAndDate = type === 'time' ? date.toLocaleTimeString('en-US') : date.toLocaleDateString('en-US');
    return timeAndDate;
  };

  const sesarAuth = async () => {
    try {
      setIsLoading(true);
      setCheckSesarAuth(true);
      if (await authenticateWithSesar()) {
        setCheckSesarAuth(false);
      }
      else {
        setIsOrcidSignInPrompt(true);
      }
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      setErrorMessage(error.toString());
      setErrorView(true);
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
      <View style={{justifyContent: 'center', alignItems: 'center', maxHeight: 400}}>
        <Text>{errorMessage}</Text>
      </View>
    );
  };

  const renderOrcidSignIn = () => {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center', maxHeight: 400}}>
        <Image
          source={require('../../assets/images/logos/orcid_logo.png')}
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
        <View style={{backgroundColor: 'rgb(164, 200, 209)'}}>
          <Image
            source={require('../../assets/images/logos/sesar2_logo.png')}
            style={{height: 100, width: '100%', borderWidth: 2}}
          />
        </View>
        {checkSesarAuth ? <View><Text>Checking SESAR Auth...</Text></View> : renderUploadContent()}
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
          onPress={() => setChangeUserCode(false)}
          type={'clear'}
        />
      </View>
    );
  };

  const renderUploadContent = () => {
    return (
      <>
        {!isEmpty(sampleValues.values.sample_id_name)
          ? <ScrollView style={{}}>
            {changeUserCode ? renderUserCodeSelection()
              : (
                <>
                  <Text style={{textAlign: 'center', padding: 10}}>This is the the data that will be uploaded to
                    SESAR:</Text>
                  <View style={{alignContent: 'center'}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <Text style={{textAlign: 'left', padding: 5}}>User Code: {sesar.selectedUserCode}</Text>
                      <Button
                        containerStyle={{}}
                        type={'outline'}
                        titleStyle={{fontWeight: 'bold', fontSize: 12}}
                        title={'Switch User'}
                        onPress={() => setChangeUserCode(true)}
                      />
                    </View>
                    <Text style={{textAlign: 'left', padding: 5}}>Collector: {commonFields.collector}</Text>
                    <Text style={{textAlign: 'left', padding: 5}}>Collection Date: {isoToLocalDateTime(
                      commonFields.collectionDate)}</Text>
                    <Text style={{textAlign: 'left', padding: 5}}>Collection Time: {isoToLocalDateTime(
                      commonFields.collectionDate, 'time')}</Text>
                    <Text style={{textAlign: 'left', padding: 5}}>Sample Type: {commonFields.sampleType}</Text>
                    <Text style={{textAlign: 'left', padding: 5}}>Material Type: {commonFields.materialType}</Text>
                    <Text style={{textAlign: 'left', padding: 5}}>Longitude: {commonFields.longitude.toFixed(5)}</Text>
                    <Text style={{textAlign: 'left', padding: 5}}>Latitude: {commonFields.latitude.toFixed(5)}</Text>
                    <Text style={{textAlign: 'left', padding: 5}}>Purpose: {commonFields.samplingPurpose}</Text>
                    <Text style={{textAlign: 'left', padding: 5}}>Description: {commonFields.description}</Text>
                  </View>
                  {!isOrcidSignInPrompt && <View style={overlayStyles.buttonContainer}>
                    <Button
                      onPress={() => registerSample({user_code: sesar.selectedUserCode, ...commonFields})}
                      title={'Register Sample'}
                      containerStyle={{padding: 10}}
                      buttonStyle={{backgroundColor: 'black', padding: 10}}
                    />
                  </View>}
                </>
              )
            }
          </ScrollView>
          : renderErrorMessage()}
      </>
    );
  };

  function renderErrorMessage() {
    return (
      <View>
        <Text style={{fontSize: 18, textAlign: 'center'}}>
          There was a error!
        </Text>
      </View>
    );
  }

  return (
    <Overlay
      overlayStyle={SMALL_SCREEN ? overlayStyles.overlayContainerFullScreen : {
        ...overlayStyles.overlayContainer,
        maxHeight: height * 0.80,
      }}
    >
      <Button
        title={'X'}
        type={'clear'}
        titleStyle={{color: 'black'}}
        containerStyle={{alignItems: 'flex-end'}}
        onPress={onModalCancel}
      />
      {isOrcidSignInPrompt ? renderOrcidSignIn() : renderSesarAuth()}
      {errorView && renderErrorView()}
      <Loading isLoading={isLoading} style={{backgroundColor: 'transparent'}}/>
    </Overlay>
  );
};

export default IGNSModal;
