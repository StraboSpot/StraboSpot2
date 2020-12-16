import React, {useEffect, useState} from 'react';
import {Animated, Keyboard, TextInput} from 'react-native';

import {Field} from 'formik';

import * as Helpers from '../../shared/Helpers';
import SectionDivider from '../../shared/ui/SectionDivider';
import {DateInputField, formStyles, NumberInputField, SelectInputField, TextInputField, useFormHook} from '../form';

const {State: TextInputState} = TextInput;

const Form = (props) => {
  const [useForm] = useFormHook();
  const [textInputAnimate] = useState(new Animated.Value(0));

  useEffect(() => {
    console.log('useEffect Form []');
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return function cleanup() {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHide);
    };
  }, []);

  const handleKeyboardDidShow = (event) => Helpers.handleKeyboardDidShow(event, TextInputState, textInputAnimate);

  const handleKeyboardDidHide = () => Helpers.handleKeyboardDidHide(textInputAnimate);

  const renderDateInput = (field) => {
    return (
      <Field
        component={DateInputField}
        name={field.name}
        label={field.label}
        key={field.name}
      />
    );
  };

  const renderGroupHeading = (field) => {
    return (
      <SectionDivider dividerText={field.label}/>
    );
  };

  const renderTextInput = (field) => {
    return (
      <Field
        component={TextInputField}
        name={field.name}
        label={field.label}
        key={field.name}
        appearance={field.appearance}
        placeholder={field.hint}
        onMyChange={props.onMyChange}
      />
    );
  };

  const renderNumberInput = (field) => {
    return (
      <Field
        component={NumberInputField}
        name={field.name}
        label={field.label}
        key={field.name}
        placeholder={field.hint}
        onMyChange={props.onMyChange}
      />
    );
  };

  const renderSelectInput = (field) => {
    const [fieldType, choicesListName] = field.type.split(' ');
    const fieldChoices = useForm.getChoices(props.formName).filter(choice => choice.list_name === choicesListName);
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
        single={fieldType === 'select_one'}
        placeholder={field.hint}
      />
    );
  };

  const renderField = (field) => {
    const fieldType = field.type.split(' ')[0];
    if (fieldType === 'begin_group') return renderGroupHeading(field);
    else if (fieldType === 'text') return renderTextInput(field);
    else if (fieldType === 'integer' || fieldType === 'decimal') return renderNumberInput(field);
    else if (fieldType === 'select_one' || fieldType === 'select_multiple') return renderSelectInput(field);
    else if (fieldType === 'date') return renderDateInput(field);
  };

  return (
    <Animated.View style={[formStyles.formContainer, {transform: [{translateY: textInputAnimate}]}]}>
      {useForm.getSurvey(props.formName).map((field, i) => {
        if (useForm.isRelevant(field, props.values)) return renderField(field);
      })}
    </Animated.View>
  );
};

export default Form;
