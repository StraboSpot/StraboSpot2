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
    onSampleFormChange: onSampleFormChange,
    selectedSampleData,
  };
};

export default useSamples;
