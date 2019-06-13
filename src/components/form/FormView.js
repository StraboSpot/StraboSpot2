import {Field} from 'formik';
//import {PropTypes} from 'prop-types';
import React, {useState, useRef} from 'react';
import {Button, View, Text} from 'react-native';
import TextInputField from './TextInputField';
import NumberInputField from './NumberInputField';
import SelectInputField from './SelectInputField';
import styles from './form.styles';
// import Papa from 'papaparse';
import {isEmpty} from "../../shared/Helpers";

import survey from './form-fields/planar-orientation-survey';
import choices from './form-fields/planar-orientation-choices';

const FormView = ({handleSubmit, isValid, setFieldValue, values}) => {

  // Determine if the field should be shown or not by looking at the relevant key-value pair
  const isRelevant = field => {
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

  const renderTextInput = field => {
    return (
      <Field
        component={TextInputField}
        name={field.name}
        label={field.label}
        key={field.name}
      />
    );
  };

  const renderNumberInput = field => {
    return (
      <Field
        component={NumberInputField}
        name={field.name}
        label={field.label}
        key={field.name}
      />
    );
  };

  const renderSelectInput = (field, choicesList) => {
    const fieldChoices = choices.filter(choice => choice.list_name === choicesList);
    const fieldChoicesCopy = JSON.parse(JSON.stringify(fieldChoices));
    fieldChoicesCopy.map((choice) => {
      choice.value = choice.name;
      delete choice.name;
      return choice
    });
    return (
      <Field
        component={SelectInputField}
        name={field.name}
        label={field.label}
        key={field.name}
        choices={fieldChoicesCopy}
      />
    );
  };

  const renderField = field => {
    const fieldType = field.type.split(" ")[0];
    if (fieldType === 'text') return renderTextInput(field);
    else if (fieldType === 'integer' || fieldType === 'decimal') return renderNumberInput(field);
    else if (fieldType === 'select_one') return renderSelectInput(field, field.type.split(" ")[1])
  };

  return (
    <View style={styles.formContainer}>
      {survey.map((field, i) => {
        if (isRelevant(field)) return renderField(field);
      })}
    </View>
  );
};

// FormView.propTypes = {
//   handleSubmit: PropTypes.func.isRequired,
//   isValid: PropTypes.bool.isRequired,
// };

export default FormView;
