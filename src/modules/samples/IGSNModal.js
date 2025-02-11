import React, {useEffect, useState} from 'react';
import {Linking, ScrollView, Text, useWindowDimensions, View} from 'react-native';

import {Button, Overlay, Input, Icon, Avatar, Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useForm from '../../modules/form/useForm';
import {isEmpty} from '../../shared/Helpers';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import Loading from '../../shared/ui/Loading';
import config from '../../utils/config';
import overlayStyles from '../home/overlays/overlay.styles';
import {setSesarToken} from '../user/userProfile.slice';


const IGNSModal = (
  {
    formRef,
    onModalCancel,
    onSavePress,
  },
) => {
  const formName = ['general', 'samples'];

  const {height} = useWindowDimensions();

  const {getLabel} = useForm();

  const formValues = formRef.values;
  const dispatch = useDispatch();
  const {encoded_login, orcidToken, name} = useSelector(state => state.user);

  useSelector(state => state.spot.selectedSpot);
  const [commonFields, setCommonFields] = useState({
    sampleType: getLabel(formValues.sample_type, formName),
    materialType: getLabel(formValues.material_type, formName),
    collector: name,
    collectionDate: formValues.collection_date,
    description: formValues.description || '',
    latitude: formValues.latitude,
    longitude: formValues.longitude,
    samplingPurpose: formValues.main_sampling_purpose,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOrcidSignInPrompt, setIsOrcidSignInPrompt] = useState(true);

  useEffect(() => {
    console.log('Orcid Token');
    setIsLoading(true);
    getSesarToken(orcidToken).catch(err => console.log('Orcid Token ERROR', err));
  }, [orcidToken]);

  const getOrcidToken = async () => {
    try {
      // if (isEmpty(orcidToken)) {
      const ORCID_CLIENT_ID = config.get('orcid_client_id');
      const url = `https://orcid.org/oauth/authorize?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=openid&redirect_uri=https://www.strabospot.org/orcid_callback%3Fcreds%3D${encodeURIComponent(
        encoded_login)}`;
      console.log(url);
      await Linking.openURL(url);
      // }
      // else {
      //   console.log('Check user ORCID token');
      // }
    }
    catch (err) {
      console.log(err);
    }
  };


  const getSesarToken = async (token) => {
    const formData = new FormData();
    formData.append('connection', 'strabospot');
    formData.append('orcid_id_token', token);

    try {
      const sesarToken = await fetch('https://app.geosamples.org/webservices/get_token.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          // 'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // body: JSON.stringify({connection: 'strabospot', orcid_id_token: orcidToken}),
        body: formData,
      });
      const sesarJson = await sesarToken.json();
      if (sesarJson.error) {
        console.error('SESAR Token Error', sesarJson.error);
        setIsOrcidSignInPrompt(true);
      }
      else {
        console.log(sesarJson);
        !isEmpty(sesarJson) && dispatch(setSesarToken(sesarJson));
        setIsOrcidSignInPrompt(false);
      }
      setIsLoading(false);
    }
    catch (err) {
      console.log('SESAR Token Error:', err);
    }
  };

  const isoToLocalDateTime = (isoString, type) => {
    const date = new Date(isoString);

    // const localDateTime = date.toLocaleString(); // Formats as date and time
    const timeAndDate = type === 'time' ? date.toLocaleTimeString('en-US') : date.toLocaleDateString('en-US');
    // const localDate = date.toLocaleDateString(); // Formats as date only
    // const localTime = date.toLocaleTimeString(); // Formats as time only

    return timeAndDate;
  };

  const refreshSesarToken = async () => {

  };

  const renderErrorMessage = () => {
    return (
      <Text style={{padding: 10, color: 'red'}}>SESAR requires a sample name. Please fill out the Sample Specific/Name
        field.</Text>
    );
  };

  return (
    <Overlay
      overlayStyle={SMALL_SCREEN ? overlayStyles.overlayContainerFullScreen : {
        ...overlayStyles.overlayContainer,
        maxHeight: height * 0.80,
      }
      }
    >
      <View>
        <Button
          title={'X'}
          type={'clear'}
          titleStyle={{color: 'black'}}
          containerStyle={{alignItems: 'flex-end'}}
          onPress={onModalCancel}
        />
        <ScrollView>
          {isOrcidSignInPrompt
            ? <View style={{justifyContent: 'center', alignItems: 'center', maxHeight: 400}}>
              <View>
                <Image
                  source={require('../../assets/images/logos/orcid_logo.png')}
                  style={{height: 60, width: 200}}
                />
              </View>
              {isLoading ?
                <Text style={{fontSize: 18, textAlign: 'center', fontWeight: 'bold', padding: 20}}>Checking ORCID
                  Credentials...</Text>
                : (
                  <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{textAlign: 'center', padding: 20, fontSize: 18, fontWeight: 'bold'}}>Please sign into
                      your ORCID account to continue.</Text>
                    <Button
                      title={'Sign into Orcid'}
                      onPress={() => getOrcidToken()}
                      buttonStyle={{backgroundColor: 'rgb(78, 114, 33)', paddingHorizontal: 50}}
                    />
                  </View>
                )}
            </View>
            : (
              <View style={{flex: 1}}>
                <View style={{backgroundColor: 'rgb(164, 200, 209)'}}>
                  <Image
                    source={require('../../assets/images/logos/sesar2_logo.png')}
                    style={{height: 100, width: '100%', borderWidth: 2}}
                    // size={'small'}
                  />
                </View>
                <Text style={{textAlign: 'center', padding: 10}}>This is the the data that will be uploaded to
                  SESAR:</Text>
                <View style={{alignContent: 'center'}}>
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
                </View>
              </View>
            )}
          {/*  {!isEmpty(formRef?.values?.sample_id_name)*/}
          {/*    ? <View style={{alignSelf: 'center'}}>*/}
          {/*  <Text style={{textAlign: 'center', padding: 10}}>This is the the data that will be uploaded to SESAR:</Text>*/}
          {/*      <View style={{alignContent: 'center'}}>*/}
          {/*        <Text style={{textAlign: 'right', padding: 5}}>Collector: {commonFields.collector}</Text>*/}
          {/*        <Text style={{textAlign: 'right', padding: 5}}>Collection Date:{'\n'} {isoToLocalDateTime(commonFields.collectionDate)}</Text>*/}
          {/*        <Text style={{textAlign: 'right', padding: 5}}>Collection Time:{'\n'} {isoToLocalDateTime(commonFields.collectionDate, 'time')}</Text>*/}
          {/*        <Text style={{textAlign: 'right', padding: 5}}>Sample Type: {commonFields.sampleType}</Text>*/}
          {/*        <Text style={{textAlign: 'right', padding: 5}}>Material Type: {commonFields.materialType}</Text>*/}
          {/*        <Text style={{textAlign: 'right', padding: 5}}>Longitude: {commonFields.longitude.toFixed(5)}</Text>*/}
          {/*        <Text style={{textAlign: 'left', padding: 5}}>Latitude: {commonFields.latitude.toFixed(5)}</Text>*/}
          {/*      </View>*/}
          {/*  </View>*/}
          {/*    : renderErrorMessage()*/}
          {/*}*/}
        </ScrollView>
        {!isOrcidSignInPrompt && <View style={overlayStyles.buttonContainer}>
          <Button
            onPress={() => onSavePress(formRef)}
            title={'Register Sample'}
            containerStyle={{padding: 10}}
            buttonStyle={{backgroundColor: 'black', padding: 10}}
          />
        </View>}
      </View>
      <Loading isLoading={isLoading} style={{backgroundColor: 'transparent'}}/>
    </Overlay>
  );
};

export default IGNSModal;
