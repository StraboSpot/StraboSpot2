import {XMLParser} from 'fast-xml-parser';
import {useDispatch, useSelector} from 'react-redux';

import useServerRequests from '../../services/useServerRequests';
import {useSpots} from '../spots';
import {setSelectedUserCode, setSesarToken, setSesarUserCodes} from '../user/userProfile.slice';
import useForm from '../form/useForm';

const useSamples = () => {
  const formName = ['general', 'samples'];
  const dispatch = useDispatch();

  const {getLabel} = useForm();
  const {getAllSpotSamplesCount} = useSpots();
  const {getSesarUserCode, refreshSesarToken} = useServerRequests();
  const {sesar, name} = useSelector(state => state.user);


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

  const buildSesarJsonObj = (sample) => {

    const selectedFeatureJSON = {
      user_code: sesar.selectedUserCode,
      sample_type: getLabel(sample.sample_type, formName),
      description: sample?.sample_method_description,
      name: sample.sample_id_name,
      material: getLabel(sample.material_type, formName),
      purpose: sample?.main_sampling_purpose,
      collection_date: sample?.collection_date,
      collection_start_time: sample?.collection_time,
      latitude: sample?.latitude,
      longitude: sample?.longitude,
      // rock_classification: getRockClassification(sample.material_type),
      collector: name,
    };

    return selectedFeatureJSON;
  };

  const getRockClassification = (materialType) => {
    if (materialType === 'intact_rock' || materialType === 'fragmented_rock') return 'Rock';
    else if (materialType === 'carbon_or_animal') return 'Organic Material';
    else return materialType;
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

  return {
    authenticateWithSesar: authenticateWithSesar,
    buildSesarJsonObj: buildSesarJsonObj,
    getAllSamplesCount: getAllSamplesCount,
    getSesarUserCode: getSesarUserCode,
    onSampleFormChange: onSampleFormChange,
    registerSample: registerSample,
  };
};

export default useSamples;
