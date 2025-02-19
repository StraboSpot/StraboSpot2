import {useState} from 'react';
import {Linking} from 'react-native';

import {useDispatch} from 'react-redux';

import {isEmpty, unixToDateTime} from '../../shared/Helpers';
import config from '../../utils/config';
import {useSpots} from '../spots';
import {setSesarToken} from '../user/userProfile.slice';
import {ORCID_PATHS, SESAR_PATHS} from '../../services/urls.constants';
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
  }

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
      // if (isEmpty(orcidToken)) {
      const url = ORCID + AUTH + SCOPE + REDIRECT_URL + encodeURIComponent(encoded_login);
      // const url = `https://orcid.org/oauth/authorize
      // ?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=openid
      // &redirect_uri=https://www.strabospot.org/orcid_callback%3Fcreds%3D${encodeURIComponent(encoded_login)}`;
      console.log(url);
      // await Linking.openURL(url);
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
        await getSesarUserCode(sesarJson);
        // console.log('USER CODE', userCode);
        setIsOrcidSignInPrompt(false);
      }
    }
    catch (err) {
      console.log('SESAR Token Error:', err);
    }
  };

  const getSesarUserCode = async (token) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Authorization',
        `Bearer ${token.access}`);

      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };

      fetch(SESAR_API + GET_USER_CODE, requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
      // fetch(url, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${token.access}`,
      //   },
      // }).then((res) => {
      //   res.text();
      // });
      // const xmlData = await userCodeXml.text();
      // const jsonData = parse(xmlData);
      // const convert = require('xml-js');
      // const result = convert.xml2json(xmlData, {compact: true, spaces: 2});
      // console.log(result);
      // console.log(jsonData);
      // const jsonResult = convert.xml2js(userCodeXml, {compact: true, spaces: 2});
      // console.log(jsonResult);
      // return jsonResult;
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

  return {
    getAllSamplesCount: getAllSamplesCount,
    getOrcidToken: getOrcidToken,
    getSesarToken: getSesarToken,
    // getSesarUserCode: getSesarUserCode,
    isOrcidSignInPrompt,
    onSampleFormChange: onSampleFormChange,
    selectedSampleData,

  };
};

export default useSamples;
