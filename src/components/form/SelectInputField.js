import {PropTypes} from 'prop-types';
import React from 'react';
import {Picker, Text, View} from 'react-native';
import styles from './form.styles';

const SelectInputField = ({
                            field: {name, onBlur, onChange, value},
                            form: {errors, touched},
                            ...props
                          }) => {

  return (
    <View>
      <View style={styles.fieldContainer}>
        <View style={styles.fieldLabelContainer}>
          <Text style={styles.fieldLabel}>{props.label}</Text>
        </View>
        <View style={styles.fieldValueContainer}>
          <Picker
            onValueChange={onChange(name)}
            // onBlur={onBlur(name)}
            selectedValue={value}
            itemStyle={styles.fieldValue}
          >
            {props.choices.map((choice) => {
              return <Picker.Item key={choice.name} label={choice.label} value={choice.name}/>
            })}
          </Picker>
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