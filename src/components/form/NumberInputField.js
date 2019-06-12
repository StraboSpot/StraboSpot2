import {PropTypes} from 'prop-types';
import React from 'react';
import {Text, TextInput, View} from 'react-native';
import styles from './form.styles';

const NumberInputField = ({
                            field: {name, onBlur, onChange, value},
                            form: {errors, touched},
                            ...props
                          }) => {

  const getDisplayValue = value => {
    if (value) return value.toString();
    return value;
  };

  return (
    <View>
      <View style={styles.fieldContainer}>
        <View style={styles.fieldLabelContainer}>
          <Text style={styles.fieldLabel}>{props.label}</Text>
        </View>
        <View style={styles.fieldValueContainer}>
          <TextInput
            onChangeText={onChange(name)}
            onBlur={onBlur(name)}
            style={styles.fieldValue}
            value={getDisplayValue(value)}
            keyboardType={'numeric'}
          />
        </View>
      </View>
      {errors[name] && touched[name] && <Text style={styles.fieldError}>{errors[name]}</Text>}
    </View>
  );
};

NumberInputField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    // value: PropTypes.number,
  }).isRequired,
  form: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    touched: PropTypes.object.isRequired,
  }).isRequired,
};

export default NumberInputField;