import * as forms from '../../assets/forms';

// Create a dictionary with the labels for each field name and
// each choice value across all forms organized by form
export const LABEL_DICTIONARY = Object.keys(forms.default).reduce((acc, key) => {
  const res = Object.keys(forms.default[key]).reduce((acc1, key1) => {
    if (forms.default[key][key1].survey && forms.default[key][key1].choices) {
      const surveyLabels1 = Object.assign({},
        ...forms.default[key][key1].survey.map(item => ({[item.name]: item.label})));
      const choicesLabels1 = Object.assign({},
        ...forms.default[key][key1].choices.map(item => ({[item.name]: item.label})));
      return {...acc1, [key1]: {...surveyLabels1, ...choicesLabels1}};
    }
    else return acc1;
  }, {});
  return {...acc, [key]: res};
}, {});

console.log('LABEL_DICTIONARY', LABEL_DICTIONARY);
