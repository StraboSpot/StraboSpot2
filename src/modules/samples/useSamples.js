import {XMLParser} from 'fast-xml-parser';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequests from '../../services/useServerRequests';
import {useSpots} from '../spots';
import {setSelectedUserCode, setSesarToken, setSesarUserCodes} from '../user/userProfile.slice';

const useSamples = (selectedFeature) => {
  const dispatch = useDispatch();

  const {getAllSpotSamplesCount} = useSpots();
  const {getSesarUserCode, refreshSesarToken} = useServerRequests();
  const {sesar} = useSelector(state => state.user);


  const {sesarToken} = sesar;

  const authenticateWithSesar = async () => {
    const validSesarToken = await getValidToken();
    if (!validSesarToken) {
      console.log('No valid token, redirecting to login...');
      return false;
    }
    else {
      const xmlData = await getSesarUserCode(validSesarToken);
      const parser = new XMLParser();
      const jsonData = parser.parse(xmlData);
      if (jsonData.results.valid === 'yes') {
        dispatch(setSesarUserCodes(jsonData.results.user_codes.user_code));
        dispatch(setSelectedUserCode(jsonData.results.user_codes.user_code[0]));
        return true;
      }
      else return false;
    }
  };

  const getRockClassification = (materialType) => {
    if (materialType === 'intact_rock' || materialType === 'fragmented_rock') {

    }
  };

  const getAllSamplesCount = async () => {
    const count = await getAllSpotSamplesCount();
    console.log('SAMPLE COUNT', count);
    return count;
  };

  const getValidToken = async () => {
    let token = sesarToken.access;
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

  const refreshToken = async () => {
    try {
      const newAccessToken = await refreshSesarToken(sesarToken.refresh);
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

  const registerSample = (sample) => {
    console.log('Register sample', sample);
  };

  const selectedSampleData = () => {
    // console.log('Selected Feature in useSamples', selectedFeature);
    const {
      collection_date,
      collection_time,
      latitude,
      longitude,
      material_type,
      rock_classifications,
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

  return {
    authenticateWithSesar: authenticateWithSesar,
    getAllSamplesCount: getAllSamplesCount,
    getSesarUserCode: getSesarUserCode,
    onSampleFormChange: onSampleFormChange,
    registerSample: registerSample,
    selectedSampleData,
  };
};

export default useSamples;
