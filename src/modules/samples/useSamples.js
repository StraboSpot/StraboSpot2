import {useSpots} from '../spots';

const useSamples = (props) => {
  const {getAllSpotSamplesCount} = useSpots();

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
  };
};

export default useSamples;
