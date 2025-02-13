import {useSpots} from '../spots';
// import convert from 'xml-js';

const useSamples = () => {
  const {getAllSpotSamplesCount} = useSpots();

  const selectedSampleData = (selectedFeature) => {
    // console.log('Selected Feature in useSamples', selectedFeature);
    const {collection_date, collection_time, latitude, longitude,material_type, sample_type, sample_id_name} = selectedFeature;
    const selectedFeatureJSON = {
      collection_date: collection_date,
      collection_time: collection_time,
      latitude: latitude,
      longitude: longitude,
      material_type: material_type,
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

  const getSesarUserCode = async (token) => {
    try {
      const url = 'https://app.geosamples.org/webservices/credentials_service_v2.php';
      console.log(JSON.parse(atob(token.access.split('.')[1])));
      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.access}`,
        },
      }).then(res => {
        res.text()
      });
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
    getSesarUserCode: getSesarUserCode,
    onSampleFormChange: onSampleFormChange,
    selectedSampleData,
  };
};

export default useSamples;
