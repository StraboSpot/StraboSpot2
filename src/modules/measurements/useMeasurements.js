import {LABEL_DICTIONARY} from '../form';

const useMeasurements = () => {

  const getLabel = (key) => {
    const measurementsDictionary = Object.values(LABEL_DICTIONARY.measurement).reduce((acc, form) => ({...acc, ...form}),
      {});
    return measurementsDictionary[key] || key.replace(/_/g, ' ');
  };

  return [{
    getLabel: getLabel,
  }];
};

export default useMeasurements;
