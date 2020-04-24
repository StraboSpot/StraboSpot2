import React, {useEffect, useState} from 'react';
import {Animated, Dimensions, Keyboard, TextInput, UIManager} from 'react-native';
import {Field} from 'formik';

// Components
import DateInputField from './DateInputField';
import NumberInputField from './NumberInputField';
import SelectInputField from './SelectInputField';
import TextInputField from './TextInputField';

// Hooks
import useFormHook from './useForm';

// Styles
import styles from './form.styles';

const {State: TextInputState} = TextInput;

const Form = (props) => {
  console.log('form props', props);
  const [useForm] = useFormHook();
  const [textInputAnimate] = useState(new Animated.Value(0));

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    return function cleanup() {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHide);
      console.log('Listners Removed');
    };
  }, []);

  const handleKeyboardDidShow = (event) => {
    const {height: windowHeight} = Dimensions.get('window');
    const keyboardHeight = event.endCoordinates.height;
    const currentlyFocusedField = TextInputState.currentlyFocusedField();
    if (currentlyFocusedField === null) return;
    else {
      UIManager.measure(currentlyFocusedField, (originX, originY, width, height, pageX, pageY) => {
        const fieldHeight = height;
        const fieldTop = pageY;
        const gap = (windowHeight - keyboardHeight) - (fieldTop + fieldHeight);
        if (gap >= 0) {
          return;
        }
        Animated.timing(
          textInputAnimate,
          {
            toValue: gap,
            duration: 200,
            useNativeDriver: true,
          },
        ).start();
      });
    }
  };

  const handleKeyboardDidHide = () => {
    Animated.timing(
      textInputAnimate,
      {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      },
    ).start();
  };

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
    const fieldChoices = useForm.getChoices(props.formName).filter(choice => choice.list_name === choicesList);
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
    <Animated.View style={[styles.formContainer, {transform: [{translateY: textInputAnimate}]}]}>
      {useForm.getSurvey(props.formName).map((field, i) => {
        if (useForm.isRelevant(field, props.values)) return renderField(field);
      })}
    </Animated.View>
  );
};

// Form.propTypes = {
//   handleSubmit: PropTypes.func.isRequired,
//   isValid: PropTypes.bool.isRequired,
// };

export default Form;
