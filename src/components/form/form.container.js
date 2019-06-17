import survey from '../form/form-fields/planar-orientation-survey';
import choices from '../form/form-fields/planar-orientation-choices';
import {isEmpty} from "../../shared/Helpers";

/*const createDefaultLabel = (data) => {
  let label = getFeatureTypeLabel(data.feature_type);
  if (isEmpty(label) && data.type) label = data.type.split('_')[0] + ' feature';
  if (data.strike) label += ' ' + data.strike.toString();
  else if (data.trend) label += ' ' + data.trend.toString();
  return label;
};*/

export const getChoices = () => {
  return choices;
};

/*const getFeatureTypeLabel = (featureType) => {
  const choiceMatched = choices.find(choice => {
    return choice.name === featureType;
  });
  return choiceMatched.label;
};*/

export const getSurvey = () => {
  return survey;
};

export const getSurveyFieldLabel = name => {
  return survey.find(field => field.name === name).label;
};

// Determine if the field should be shown or not by looking at the relevant key-value pair
export const isRelevant = (field, values) => {
  //console.log('values', values);
  if (isEmpty(field.relevant)) return true;
  let relevant = field.relevant;
  relevant = relevant.replace(/selected\(\$/g, '.includes(');
  relevant = relevant.replace(/\$/g, '');
  relevant = relevant.replace(/{/g, 'values.');
  relevant = relevant.replace(/}/g, '');
  relevant = relevant.replace(/''/g, 'undefined');
  relevant = relevant.replace(/ = /g, ' == ');
  relevant = relevant.replace(/ or /g, ' || ');
  relevant = relevant.replace(/ and /g, ' && ');
  //console.log(field.name, 'relevant:', relevant);

  try {
    return eval(relevant);
  } catch (e) {
    return false;
  }
};

export const validateForm = (data) => {
  console.log('Validating Form with', data);
  const errors = {};

  survey.forEach(fieldModel => {
    const key = fieldModel.name;
    const value = data[key];
    const label = fieldModel.label;
    if (value && typeof value === 'string') data[key] = value.trim();
    if (data.hasOwnProperty(key) && isEmpty(value)) delete data[key];
    if (isEmpty(value) && fieldModel.required && isRelevant(fieldModel, data)) errors[key] = 'Required';
    else if (value) {
      if (fieldModel.type === 'integer') data[key] = parseInt(value);
      else if (fieldModel.type === 'decimal') data[key] = parseFloat(value);
      if (fieldModel.constraint) {
        // Max constraint
        // Look for <= in constraint, followed by a space and then any number of digits (- preceding the digits is optional)
        let regexMax = /<=\s(-?\d*)/i;
        let parsedConstraint = fieldModel.constraint.match(regexMax);
        if (parsedConstraint) {
          let max = parseFloat(parsedConstraint[1]);
          if (!isEmpty(max) && !(value <= max)) errors[key] = fieldModel.constraint_message;
        }
        else {
          // Look for < in constraint
          regexMax = /<\s(-?\d*)/i;
          let parsedConstraint = fieldModel.constraint.match(regexMax);
          if (parsedConstraint) {
            let max = parseFloat(parsedConstraint[1]);
            if (!isEmpty(max) && !(value < max)) errors[key] = fieldModel.constraint_message;
          }
        }
        // Min constraint
        // Look for <= in constraint, followed by a space and then any number of digits (- preceding the digits is optional)
        let regexMin = />=\s(-?\d*)/i;
        parsedConstraint = fieldModel.constraint.match(regexMin);
        if (parsedConstraint) {
          let min = parseFloat(parsedConstraint[1]);
          if (!isEmpty(min) && !(value >= min)) errors[key] = fieldModel.constraint_message;
        }
        else {
          // Look for < in constraint
          regexMin = />\s(-?\d*)/i;
          let parsedConstraint = fieldModel.constraint.match(regexMin);
          if (parsedConstraint) {
            let min = parseFloat(parsedConstraint[1]);
            if (!isEmpty(min) && !(value > min)) errors[key] = fieldModel.constraint_message;
          }
        }
      }
    }
  });
  if (isEmpty(data.label)) data.label = createDefaultLabel(data);
  console.log('Data after validation:', data, 'Errors:', errors);
  return errors;
};