import {useState} from 'react';
import {Linking} from 'react-native';

import { XMLParser } from 'fast-xml-parser';
import {useDispatch, useSelector} from 'react-redux';

import {ORCID_PATHS, SESAR_PATHS} from '../../services/urls.constants';
import {isEmpty, unixToDateTime} from '../../shared/Helpers';
import config from '../../utils/config';
import {useSpots} from '../spots';
import {setSesarToken, setSesarUserCodes} from '../user/userProfile.slice';

// import {parseString} from 'xml2js';
// import convert from 'xml-js';

const useSamples = (selectedFeature) => {
const {SESAR_API, GET_TOKEN, GET_USER_CODE} = SESAR_PATHS;
const {ORCID, AUTH, SCOPE, REDIRECT_URL} = ORCID_PATHS;
  const dispatch = useDispatch();

  const {getAllSpotSamplesCount} = useSpots();

  const [isOrcidSignInPrompt, setIsOrcidSignInPrompt] = useState(true);

  const getRockClassification = (materialType) => {
    if (materialType === 'intact_rock' || materialType === 'fragmented_rock') {

    }
  };

  const selectedSampleData = () => {
    // console.log('Selected Feature in useSamples', selectedFeature);
    const {
      collection_date,
      collection_time,
      latitude,
      longitude,
      material_type,
      rock_classification,
      sample_type,
      sample_id_name,
    } = selectedFeature;

    const selectedFeatureJSON = {
      collection_date: collection_date,
      collection_time: collection_time,
      latitude: latitude,
      longitude: longitude,
      material_type: material_type,
      rock_classification: getRockClassification(material_type),
      sample_id_name: sample_id_name,
      sample_type: sample_type,
    };
    console.log('Selected Feature JSON in useSamples', selectedFeatureJSON);
  };

  const getAllSamplesCount = async () => {
    const count = await getAllSpotSamplesCount();
    console.log('SAMPLE COUNT', count);
    return count;
  };

  const getOrcidToken = async (encoded_login) => {
    try {
      const url = ORCID + AUTH + SCOPE + REDIRECT_URL + encodeURIComponent(encoded_login);
      console.log(url);
      await Linking.openURL(url);
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
      const sesarToken = await fetch(SESAR_API + GET_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
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
        const accessTokenParsed = JSON.parse(atob(sesarJson.access.split('.')[1]));
        const expDateTime = unixToDateTime(accessTokenParsed.exp).toUTCString();
        !isEmpty(sesarJson) && dispatch(setSesarToken({access: sesarJson.access, refresh: sesarJson.refresh, expiration: expDateTime}));
        // await getSesarUserCode(sesarJson);
        // console.log('USER CODE', userCode);
        setIsOrcidSignInPrompt(false);
      }
    }
    catch (err) {
      console.log('SESAR Token Error:', err);
    }
  };

  const getSesarUserCode = async (accessToken) => {
    try {
      const userCodeXml = await fetch(SESAR_API + GET_USER_CODE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const xmlData = await userCodeXml.text();
      console.log(xmlData);
      const parser = new XMLParser();
      const jsonData = parser.parse(xmlData);
      console.log(jsonData);
      if (jsonData.results.valid === 'yes' && !isEmpty(jsonData.results.user_codes.user_code)) {
        dispatch(setSesarUserCodes(jsonData.results.user_codes.user_code));
      }
    }
    catch (error) {
      console.log('Error getting SESAR user code', error);
    }

  };

  const onSampleFormChange = (formCurrent, name, value) => {
    console.log(name, 'changed to', value);
    name === 'collection_date'
      ? formCurrent.setFieldValue('collection_time', value)
      : name === 'collection_time'
        ? formCurrent.setFieldValue('collection_date', value)
        : formCurrent.setFieldValue(name, value);
    // formCurrent.setFieldValue(name, value);
  };

  const registerSample = (sample) => {
    console.log('Register sample', sample);
  }

  return {
    getAllSamplesCount: getAllSamplesCount,
    getOrcidToken: getOrcidToken,
    getSesarToken: getSesarToken,
    getSesarUserCode: getSesarUserCode,
    isOrcidSignInPrompt,
    onSampleFormChange: onSampleFormChange,
    registerSample: registerSample,
    selectedSampleData,
  };
};

export default useSamples;
