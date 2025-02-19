import React, {useEffect, useState} from 'react';
import {ScrollView, Text, useWindowDimensions, View} from 'react-native';

import {Button, Overlay, Image} from 'react-native-elements';
import {useSelector} from 'react-redux';

import useSamples from './useSamples';
import useForm from '../../modules/form/useForm';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import Loading from '../../shared/ui/Loading';
import overlayStyles from '../home/overlays/overlay.styles';


const IGNSModal = (
  {
    formRef,
    onModalCancel,
    onSavePress,
    selectedFeature,
  },
) => {
  const formName = ['general', 'samples'];

  const {height} = useWindowDimensions();
  const {isOrcidSignInPrompt, getOrcidToken, getSesarToken, selectedSampleData} = useSamples(selectedFeature);

  const {getLabel} = useForm();

  const formValues = formRef.values;
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

  useEffect(() => {
    console.log('Orcid Token');
    // console.log('Selected Feature', selectedFeature);
    selectedSampleData();
    loginToSesar().catch(err => console.error('Error logging into SESAR', err));
  }, [orcidToken]);

  const isoToLocalDateTime = (isoString, type) => {
    const date = new Date(isoString);
    const timeAndDate = type === 'time' ? date.toLocaleTimeString('en-US') : date.toLocaleDateString('en-US');
    return timeAndDate;
  };

  const loginToSesar = async () => {
    setIsLoading(true);
    await getSesarToken(orcidToken);
    setIsLoading(false);
  };

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
      <ScrollView>
        {isOrcidSignInPrompt
          ? (
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
                      onPress={() => getOrcidToken(encoded_login)}
                      buttonStyle={{backgroundColor: 'rgb(78, 114, 33)', paddingHorizontal: 50}}
                    />
                  </View>
                )
              }
            </View>
          )
          : (
            <View style={{flex: 1}}>
              <View style={{backgroundColor: 'rgb(164, 200, 209)'}}>
                <Image
                  source={require('../../assets/images/logos/sesar2_logo.png')}
                  style={{height: 100, width: '100%', borderWidth: 2}}
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
      <Loading isLoading={isLoading} style={{backgroundColor: 'transparent'}}/>
    </Overlay>
  );
};

export default IGNSModal;
