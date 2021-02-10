import React, {useEffect, useState} from 'react';
import {Alert, Animated, FlatList, Keyboard, TextInput} from 'react-native';

import {Field} from 'formik';
import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import * as Helpers from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SectionDivider from '../../shared/ui/SectionDivider';
import {DateInputField, NumberInputField, SelectInputField, TextInputField, useFormHook} from '../form';
import {LABELS_WITH_ABBREVIATIONS} from '../petrology/petrology.constants';

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
        onShowFieldInfo={showFieldInfo}
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
        onShowFieldInfo={showFieldInfo}
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
        onShowFieldInfo={showFieldInfo}
      />
    );
  };

  const renderField = (field) => {
    const fieldType = field.type.split(' ')[0];
    return (
      <React.Fragment>
        {fieldType === 'begin_group' && renderGroupHeading(field)}
        {(fieldType === 'text' || fieldType === 'integer' || fieldType === 'decimal' || fieldType === 'select_one'
          || fieldType === 'select_multiple' || fieldType === 'date') && (
          <ListItem containerStyle={commonStyles.listItemFormField}>
            <ListItem.Content>
              {fieldType === 'text' && renderTextInput(field)}
              {(fieldType === 'integer' || fieldType === 'decimal') && renderNumberInput(field)}
              {(fieldType === 'select_one' || fieldType === 'select_multiple') && renderSelectInput(field)}
              {fieldType === 'date' && renderDateInput(field)}
            </ListItem.Content>
          </ListItem>
        )}
      </React.Fragment>
    );
  };

  const showFieldInfo = (label, info) => {
    if (label === 'Mineral Name Abbreviation') {
      info += '\n\n';
      const arr = Object.entries(LABELS_WITH_ABBREVIATIONS).map(([key, value]) => key + ': ' + value);
      info += arr.join('\n');
    }
    Alert.alert(label, info);
  };

  return (
    <Animated.View style={{transform: [{translateY: textInputAnimate}]}}>
      <FlatList
        keyExtractor={(item) => item.name}
        data={Object.values(useForm.getSurvey(props.formName).filter(item => useForm.isRelevant(item, props.values)))}
        renderItem={({item}) => renderField(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    </Animated.View>
  );
};

export default Form;
