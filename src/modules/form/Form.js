import React, {useEffect, useState} from 'react';
import {
  Animated,
  Button,
  Dimensions,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import {Field} from 'formik';

import {getChoices, getSurvey, isRelevant} from './form.container';
import DateInputField from './DateInputField';
import NumberInputField from './NumberInputField';
import SelectInputField from './SelectInputField';
import TextInputField from './TextInputField';

// Styles
import styles from './form.styles';

const {State: TextInputState} = TextInput;

const Form = (props) => {
  const [textInputAnimate] = useState(new Animated.Value(0));
  const [selectOnePage, setSelectOnePage] = useState(false);
  // const [fieldValue, setFieldValue] = useState(null);

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
    if (currentlyFocusedField === null) {
      return;
    }
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

  // const toggleSelectOne = (field) => {
  //   setSelectOnePage(!selectOnePage);
  //   console.log(field);
  // };

  // const renderSelectOneInput = () => {
  //   return (
  //     <View>
  //       <Text>{fieldValue.label}</Text>
  //     </View>
  //   );
  // };

  return (
    <Animated.View style={[styles.formContainer, {transform: [{translateY: textInputAnimate}]}]}>
      {/*{selectOnePage ?*/}
      {/*  <View>{renderSelectOneInput()}<Button title={'Back'} onPress={() => setSelectOnePage(null)}/></View> :*/}
      {getSurvey().map((field, i) => {
        if (isRelevant(field, props.values)) return renderField(field);
      })}
      {/*}*/}
    </Animated.View>
  );
};

// Form.propTypes = {
//   handleSubmit: PropTypes.func.isRequired,
//   isValid: PropTypes.bool.isRequired,
// };

export default Form;
