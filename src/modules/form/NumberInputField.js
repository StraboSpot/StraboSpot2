import React from 'react';
import {Text, TextInput, View} from 'react-native';

import PropTypes from 'prop-types';

import {isEmpty} from '../../shared/Helpers';

// Styles
import styles from './form.styles';
import stylesCommon from '../../shared/common.styles';

const NumberInputField = ({
                            field: {name, onBlur, onChange, value},
                            form: {errors, touched},
                            ...props
                          }) => {

  const getDisplayValue = value => {
    if (!isEmpty(value)) return value.toString();
    return value;
  };

  return (
    <View style={stylesCommon.rowContainer}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        onChangeText={onChange(name)}
        onBlur={onBlur(name)}
        style={styles.fieldValue}
        value={getDisplayValue(value)}
        keyboardType={'numeric'}
      />
      {errors[name] && <Text style={styles.fieldError}>{errors[name]}</Text>}
    </View>
  );
};

NumberInputField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.number,
  }).isRequired,
  form: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    touched: PropTypes.object.isRequired,
  }).isRequired,
};

export default NumberInputField;
