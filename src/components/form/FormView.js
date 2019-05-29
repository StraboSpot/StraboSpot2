import {Field} from 'formik';
//import {PropTypes} from 'prop-types';
import React from 'react';
import {Button, View} from 'react-native';
import TextInputField from './TextInputField';
import styles from './form.styles';

const FormView = ({handleSubmit, isValid}) => (
  <View style={styles.formContainer}>
    <Field
      component={TextInputField}
      name="firstName"
    />
    <Field
      component={TextInputField}
      name="lastName"
    />
    {/*<Button*/}
    {/*  disabled={!isValid}*/}
    {/*  title="Submit Form"*/}
    {/*  onPress={handleSubmit}*/}
    {/*/>*/}
  </View>
);

// FormView.propTypes = {
//   handleSubmit: PropTypes.func.isRequired,
//   isValid: PropTypes.bool.isRequired,
// };

export default FormView;