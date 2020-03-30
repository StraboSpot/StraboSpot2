import React from 'react';
import {View} from 'react-native';
import {Field} from 'formik';

import {getChoices, getSurvey, isRelevant} from './form.container';
import DateInputField from './DateInputField';
import NumberInputField from './NumberInputField';
import SelectInputField from './SelectInputField';
import TextInputField from './TextInputField';

// Styles
import styles from './form.styles';

const Form = (props) => {

  const renderDateInput = field => {
    return (
      <Field
        component={DateInputField}
        name={field.name}
        label={field.label}
        key={field.name}
      />
    );
  };

  const renderTextInput = field => {
    return (
      <Field
        component={TextInputField}
        name={field.name}
        label={field.label}
        key={field.name}
        appearance={field.appearance}
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
    const fieldChoices = getChoices().filter(choice => choice.list_name === choicesList);
    const fieldChoicesCopy = JSON.parse(JSON.stringify(fieldChoices));
    fieldChoicesCopy.map((choice) => {
      choice.value = choice.name;
      delete choice.name;
      return choice;
    });
    return (
      <Field
        as={SelectInputField}
        name={field.name}
        label={field.label}
        key={field.name}
        choices={fieldChoicesCopy}
        setFieldValue={props.setFieldValue}
      />
    );
  };

  const renderField = field => {
    const fieldType = field.type.split(' ')[0];
    if (fieldType === 'text') return renderTextInput(field);
    else if (fieldType === 'integer' || fieldType === 'decimal') return renderNumberInput(field);
    else if (fieldType === 'select_one') return renderSelectInput(field, field.type.split(' ')[1]);
    else if (fieldType === 'date') return renderDateInput(field);
  };

  return (
    <View style={styles.formContainer}>
      {getSurvey().map((field, i) => {
        if (isRelevant(field, props.values)) return renderField(field);
      })}
    </View>
  );
};

// Form.propTypes = {
//   handleSubmit: PropTypes.func.isRequired,
//   isValid: PropTypes.bool.isRequired,
// };

export default Form;
