import * as forms from '../../assets/forms/forms.index';
import {isEmpty} from '../../shared/Helpers';

// Create a dictionary with the labels for each field name and each choice value across all forms
export const labelDictionary = Object.keys(forms.default).reduce((acc, key) => {

  // Check for duplicate keys (field name or choice value) where the values (labels) don't match and log them
  const duplicateKeyCheck = (obj) => {
    Object.entries(obj).forEach(([key1, value]) => {
      if (Object.keys(acc).includes(key1) && acc[key1] !== value) {
        console.warn('Fix duplicate field name or choice value but mismatched label:',
          '{' + key1 + ': ' + acc[key1] + '}', 'vs', '{' + key1 + ': ' + value + '}');
      }
    });
  };

  if (forms.default[key].survey && forms.default[key].choices) {
    const surveyLabels = Object.assign({}, ...forms.default[key].survey.map(item => ({[item.name]: item.label})));
    const choicesLabels = Object.assign({}, ...forms.default[key].choices.map(item => ({[item.name]: item.label})));
    duplicateKeyCheck({...surveyLabels, ...choicesLabels});
    return {...acc, ...surveyLabels, ...choicesLabels};
  }
  else if (forms.default[key].survey) {
    const surveyLabels = Object.assign({}, ...forms.default[key].survey.map(item => ({[item.name]: item.label})));
    duplicateKeyCheck(surveyLabels);
    return {...acc, ...surveyLabels};
  }
  else {
    const res = Object.keys(forms.default[key]).reduce((acc1, key1) => {
      if (forms.default[key][key1].survey && forms.default[key][key1].choices) {
        const surveyLabels1 = Object.assign({},
          ...forms.default[key][key1].survey.map(item => ({[item.name]: item.label})));
        const choicesLabels1 = Object.assign({},
          ...forms.default[key][key1].choices.map(item => ({[item.name]: item.label})));
        duplicateKeyCheck({...surveyLabels1, ...choicesLabels1});
        return {...acc1, ...surveyLabels1, ...choicesLabels1};
      }
      else return acc1;
    }, []);
    return {...acc, ...res};
  }
}, []);

if (!isEmpty(labelDictionary)) {

  // Sort object by key
  function objSort(obj) {
    return Object.keys(obj)
      .sort().reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {});
  }

  const labelDictionarySorted = objSort(labelDictionary);
  console.log('Label Dictionary Sorted', labelDictionarySorted);
}
