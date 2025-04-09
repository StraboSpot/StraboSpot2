import React from 'react';

import {XMLParser} from 'fast-xml-parser';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequests from '../../services/useServerRequests';
import {isEmpty} from '../../shared/Helpers';
import useForm from '../form/useForm';
import {PAGE_KEYS} from '../page/page.constants';
import {editedSpotProperties} from '../spots/spots.slice';
import {setSesarToken, setSesarUserCodes} from '../user/userProfile.slice';

const useSamples = () => {
  const formName = ['general', 'samples'];
  const dispatch = useDispatch();

  const {getLabel} = useForm();
  const {getSesarUserCode, postToSesar, refreshSesarToken, updateSampleWithSesar} = useServerRequests();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const {sesar, name} = useSelector(state => state.user);
  // const [sampleValue, setSampleValue] = React.useState({});

  const addIGSNToSample = (data, sampleValue) => {
    // let spotSamplesData = selectedSpot.properties.samples;
    const updatedSampleList =  selectedSpot.properties.samples.map((spot) => {
      if (spot.id === sampleValue.id) {
        return {
          ...sampleValue,
          Sample_IGSN: data.igsn,
          isOnMySesar: true,
        };
      }
      return spot;
    });
    dispatch(editedSpotProperties({field: PAGE_KEYS.SAMPLES, value: updatedSampleList}));
  };

  const authenticateWithSesar = async () => {
    const validSesarToken = await getValidToken();
    if (!validSesarToken) {
      console.log('No valid token, redirecting to login...');
      return false;
    }
    else return validSesarToken;
  };

  const buildSesarXmlSchema = (data, isUpdating) => {
    // const userCode = !isUpdating ? <user_code>${data.user_code}</user_code> : ""
    return `content=<?xml version="1.0" encoding="UTF-8"?>
  <samples xmlns="http://app.geosamples.org"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://app.geosamples.org/4.0/sample.xsd">
      <sample>
           ${!isUpdating ? `<user_code>${data.user_code}</user_code>` : ''}
           <collector>${data.collector}</collector>
           ${data.igsn ? `<igsn>${data.igsn}</igsn>` : ''}
           <longitude>${data.longitude}</longitude>
           <latitude>${data.latitude}</latitude>
           <collection_start_date>${data.collection_start_date}</collection_start_date>
           <purpose>${data.purpose}</purpose>
           <description>${data.description}</description>
           <material>${data.material}</material>
           <sample_type>${data.sample_type}</sample_type>
           <name>${data.name}</name>
      </sample>
  </samples>`;
  };

  const getMaterialName = (materialType) => {
    if (materialType === 'intact_rock' || materialType === 'fragmented_roc') {
      return 'Rock';
    }
    else if (materialType === 'carbon_or_animal') return 'Organic Material';
    else return materialType;
  };

  const getAndSaveSesarCode = async (token) => {
    const res = await getSesarUserCode(token);
    const jsonData = parseXML(res);
    if (jsonData.results.valid === 'yes') {
      dispatch(setSesarUserCodes(jsonData.results.user_codes.user_code));
    }
    else throw Error();
  }

  const straboSesarMapping = (sampleValue) => {
    const mappedObj = [
      {label: 'IGSN:', sesarKey: 'igsn', value: sampleValue?.Sample_IGSN}, // required when updating sample
      {label: 'User Code', sesarKey: 'user_code', value: sesar?.selectedUserCode}, //required
      {label: 'Sample Type:', sesarKey: 'sample_type', value: getLabel(sampleValue?.sample_type, formName)}, //required
      {label: 'Sample Name:', sesarKey: 'name', value: sampleValue.sample_id_name}, //required
      {label: 'Material:', sesarKey: 'material', value: getMaterialName(sampleValue?.material_type)}, //required
      // {label: 'Classification:', sesarKey: 'classification', value: getRockClassification()}, //required
      {label: 'Description:', sesarKey: 'description', value: sampleValue?.sample_description},
      {label: 'Purpose:', sesarKey: 'purpose', value: sampleValue?.main_sampling_purpose},
      {label: 'Collection Date (Time):', sesarKey: 'collection_start_date', value: sampleValue?.collection_date},
      // {label: 'Collection Time:', sesarKey: 'collection_time', value: sampleValue?.collection_time},
      {label: 'Latitude:', sesarKey: 'latitude', value: sampleValue?.latitude},
      {label: 'Longitude:', sesarKey: 'longitude', value: sampleValue?.longitude},
      {label: 'Collector:', sesarKey: 'collector', value: name},
    ];
    return mappedObj;
  };

  const getValidToken = async () => {
    let token = sesar?.sesarToken.access;
    if (isTokenExpired(token)) {
      console.log('Token expired, refreshing...');
      token = await refreshToken();
    }
    return token;
  };

  const isTokenExpired = (token) => {
    if (!token) return true; // No token = expired
    try {
      const accessTokenParsed = JSON.parse(atob(token.split('.')[1]));
      return accessTokenParsed.exp < Math.floor(Date.now() / 1000); // Compare expiration to current time
    }
    catch (error) {
      return true; // If decoding fails, assume expired
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

  const parseXML = (xmlData) => {
    const parser = new XMLParser();
    return parser.parse(xmlData);
  };

  const refreshToken = async () => {
    try {
      const newAccessToken = await refreshSesarToken(sesar?.sesarToken.refresh);
      console.log(newAccessToken);
      if (newAccessToken.error) {
        console.error('Token refresh failed:', newAccessToken.error);
        return null;
      }
      dispatch(setSesarToken(newAccessToken));
      return newAccessToken.access;
    }
    catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  const convertToJSON = (mappingArray) => {
    return mappingArray.slice().reverse().reduce((acc, item) => {
      if (item.sesarKey && item.value !== undefined) {
        acc[item.sesarKey] = item.value;
      }
      return acc;
    }, {});
  };

  const convertAndBuildSchema = (mappedArray, isUpdating) => {
    const jsonData = convertToJSON(mappedArray);
    console.log(jsonData);
    const updatedJsonData = {...jsonData, collection_start_date: truncateDateISOString(jsonData.collection_start_date)};
    const xmlSchema = buildSesarXmlSchema(updatedJsonData, isUpdating);
    console.log('SESAR SCHEMA', xmlSchema);
    return xmlSchema;
  };

  const truncateDateISOString = (date) => {
    return date.slice(0, date.indexOf('.')) + 'Z';
  };

  const postSampleToSesar = async (xmlSchema, sample, isUpdating) => {
    const response = isUpdating ? await updateSampleWithSesar(xmlSchema) : await postToSesar(xmlSchema, sesar.sesarToken.access);
    const resText = await response.text();
    const json = parseXML(resText);
    console.log('SAMPLE Response json', json);
    if (response.ok) {
      isEmpty(sample.Sample_IGSN) && addIGSNToSample(json.results.sample, sample);
      return json.results.sample;
    }
    else if (json.results.sample.error) {
      throw Error(json.results.sample.error);
    }
    else throw Error('Something happened. Please try again later.');
  };

  const uploadSample = async (sample) => {
    // setSampleValue(sample);
    const mappedArray = straboSesarMapping(sample);
    console.log('Register sample', mappedArray);
    const xmlSchema = convertAndBuildSchema(mappedArray, false);
    return await postSampleToSesar(xmlSchema, sample);
  };

  const updateSampleIsSesar = async (updatedSample) => {
    console.log('Update sample', updatedSample);
    const mappedArray = straboSesarMapping(updatedSample);
    console.log(mappedArray);
    const xmlSchema = convertAndBuildSchema(mappedArray, true);
    return await postSampleToSesar(xmlSchema, updatedSample, true);
  };

  return {
    authenticateWithSesar: authenticateWithSesar,
    getAndSaveSesarCode: getAndSaveSesarCode,
    onSampleFormChange: onSampleFormChange,
    uploadSample: uploadSample,
    updateSampleIsSesar:updateSampleIsSesar,
    straboSesarMapping,
  };
};

export default useSamples;
