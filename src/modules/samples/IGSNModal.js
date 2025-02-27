import React, {useEffect, useState} from 'react';
import {ScrollView, Text, useWindowDimensions, View} from 'react-native';

import {Button, Overlay, Image} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import useSamples from './useSamples';
import useForm from '../../modules/form/useForm';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import Loading from '../../shared/ui/Loading';
import overlayStyles from '../home/overlays/overlay.styles';
import {isEmpty} from '../../shared/Helpers';
import {Picker} from '@react-native-picker/picker';
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
  const {isOrcidSignInPrompt, getOrcidToken, getSesarToken, getSesarUserCode, registerSample, selectedSampleData} = useSamples(selectedFeature);

  const {getLabel} = useForm();

  // const formValues = formRef?.values;
  const dispatch = useDispatch();
  const {encoded_login, orcidToken, name, sesar} = useSelector(state => state.user);

  // useSelector(state => state.spot.selectedSpot);
  const [changeUserCode, setChangeUserCode] = useState(false);
  const [commonFields, setCommonFields] = useState({
    sampleType: getLabel(selectedFeature.sample_type, formName),
    materialType: getLabel(selectedFeature.material_type, formName),
    collector: name,
    collectionDate: selectedFeature.collection_date,
    description: selectedFeature.description || '',
    latitude: selectedFeature.latitude,
    longitude: selectedFeature.longitude,
    samplingPurpose: selectedFeature.main_sampling_purpose,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // selectedSampleData();
    loginToSesar().catch(err => console.error('Error logging into SESAR', err));
  }, [orcidToken]);

  const isoToLocalDateTime = (isoString, type) => {
    const date = new Date(isoString);
    const timeAndDate = type === 'time' ? date.toLocaleTimeString('en-US') : date.toLocaleDateString('en-US');
    return timeAndDate;
  };

  const loginToSesar = async () => {
    setIsLoading(true);
    await getSesarToken(orcidToken.token);
    await getSesarUserCode(sesar.sesarToken.access);
    setIsLoading(false);
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
                onPress={() => getOrcidToken(encoded_login)}
                buttonStyle={{backgroundColor: 'rgb(78, 114, 33)', paddingHorizontal: 50}}
              />
            </View>
          )
        }
      </View>
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
        <View style={{backgroundColor: 'rgb(164, 200, 209)'}}>
          <Image
            source={require('../../assets/images/logos/sesar2_logo.png')}
            style={{height: 100, width: '100%', borderWidth: 2}}
          />
        </View>
        {!isEmpty(selectedFeature.sample_id_name)
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
      {isOrcidSignInPrompt ? renderOrcidSignIn() : renderUploadContent()}
      <Loading isLoading={isLoading} style={{backgroundColor: 'transparent'}}/>
    </Overlay>
  );
};

export default IGNSModal;
