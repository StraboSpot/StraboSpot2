import LABEL_DICTIONARY from '../../assets/forms';

const threeDStructuresDictionary = Object.values(LABEL_DICTIONARY._3d_structures).reduce(
  (acc, form) => ({...acc, ...form}), {});

export const getLabel = (key) => {
  if (Array.isArray(key)) {
    const labelsArr = key.map(val => threeDStructuresDictionary[val] || val);
    return labelsArr.join(', ');
  }
  return threeDStructuresDictionary[key] || key;
};

export const get3dStructureTitle = (threeDStructure) => {
  console.log(threeDStructure.label || getLabel(threeDStructure.feature_type) || getLabel(threeDStructure.type) || '');
  return threeDStructure.label || getLabel(threeDStructure.feature_type) || getLabel(threeDStructure.type) || '';
};
