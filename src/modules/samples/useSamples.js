import {XMLParser} from 'fast-xml-parser';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequests from '../../services/useServerRequests';
import useForm from '../form/useForm';
import {setSelectedUserCode, setSesarToken, setSesarUserCodes} from '../user/userProfile.slice';

const useSamples = (sampleValue) => {
  const formName = ['general', 'samples'];
  const dispatch = useDispatch();

  const {getLabel} = useForm();
  const {getSesarUserCode, postToSesar, refreshSesarToken} = useServerRequests();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const {sesar, name} = useSelector(state => state.user);

  const addIGSNToSample = (data) => {
    // let spotSamplesData = selectedSpot.properties.samples;
    return selectedSpot.properties.samples.map((spot) => {
      if (spot.id === sampleValue.id) {
        return {
          ...sampleValue,
          Sample_IGSN: data.igsn,
          isOnMySesar: true,
        };
      }
      return spot;
    });
    // console.log(updatedSamples);
    // dispatch(editedSpotProperties({field: PAGE_KEYS.SAMPLES, value: updatedSamples}));
  };

  const authenticateWithSesar = async () => {
    const validSesarToken = await getValidToken();
    if (!validSesarToken) {
      console.log('No valid token, redirecting to login...');
      return false;
    }
    else {
      const xmlData = await getSesarUserCode(validSesarToken);
      const jsonData = parseXML(xmlData);
      if (jsonData.results.valid === 'yes') {
        dispatch(setSesarUserCodes(jsonData.results.user_codes.user_code));
        dispatch(setSelectedUserCode(jsonData.results.user_codes.user_code[0]));
        return true;
      }
      else return false;
    }
  };

  const buildSesarXmlSchema = (data) => {
    return `content=<?xml version="1.0" encoding="UTF-8"?>
  <samples xmlns="http://app.geosamples.org"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://app.geosamples.org/4.0/sample.xsd">
      <sample>
           <user_code>${data.user_code}</user_code>
           <collector>${data.collector}</collector>
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

  const straboSesarMapping = () => {
    const mappedObj = [
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

  const truncateDateISOString = (date) => {
    return date.slice(0, date.indexOf('.')) + 'Z';
  };

  const registerSample = async (sample) => {
    console.log('Register sample', sample);
    const jsonData = convertToJSON(sample);
    console.log(jsonData);
    const updatedJsonData = {...jsonData, collection_start_date: truncateDateISOString(jsonData.collection_start_date)};
    const xmlSchema = buildSesarXmlSchema(updatedJsonData);
    console.log('SESAR SCHEMA', xmlSchema);
    const response = await postToSesar(xmlSchema, sesar.sesarToken.access);
    const json = parseXML(response);
    console.log('SAMPLE Response json', json);
    if (json.results.valid === 'no') {
      console.error('Error Registering sample', json.results.error);
      throw Error(json.results.error);
    }
    else {
      const updatedSamples = addIGSNToSample(json.results.sample);
      return {updatedSamples: updatedSamples, jsonResults: json.results.sample};
    }
  };

  return {
    authenticateWithSesar: authenticateWithSesar,
    getSesarUserCode: getSesarUserCode,
    onSampleFormChange: onSampleFormChange,
    registerSample: registerSample,
    straboSesarMapping,
  };
};

export default useSamples;
