import {PropTypes} from 'prop-types';
import React from 'react';
import {Text, View} from 'react-native';
import Picker from 'react-native-picker-select'
import styles from './form.styles';

const SelectInputField = ({
                            field: {name, onBlur, onChange, value},
                            form: {errors, touched},
                            ...props
                          }) => {
  const placeholder = {
    label: `-- Select ${props.label} --`,
    value: null,
    color: 'black',
  };

  const pickerStyle = {
    inputIOS: styles.pickerStyle,
    inputAndroid: styles.pickerStyle
  };

  return (
    <View>
      <View style={styles.fieldContainer}>
        <View style={styles.fieldLabelContainer}>
          <Text style={styles.fieldLabel}>{props.label}</Text>
        </View>
        <View style={styles.fieldValueContainer}>
          <Picker
            placeholder={placeholder}
            onValueChange={onChange(name)}
            items={props.choices}
            style={pickerStyle}
            value={value}
          />
        </View>
      </View>
    </View>
  );
};

SelectInputField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }).isRequired,
  form: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    touched: PropTypes.object.isRequired,
  }).isRequired,
};

export default SelectInputField;
