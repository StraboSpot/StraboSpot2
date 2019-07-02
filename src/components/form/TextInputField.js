import {PropTypes} from 'prop-types';
import React from 'react';
import {Text, TextInput, View} from 'react-native';

// Styles
import styles from './form.styles';
import stylesCommon from "../../shared/common.styles";

const TextInputField = ({
                          field: {name, onBlur, onChange, value},
                          form: {errors, touched},
                          ...props
                        }) => {

  if (props.appearance === 'multiline') {
    return (
      <View style={styles.notesFieldContainer}>
          <View style={styles.notesFieldLabelContainer}>
            <Text style={styles.fieldLabel}>{props.label}</Text>
          </View>
          <View style={styles.notesFieldValueContainer}>
            <TextInput
              onChangeText={onChange(name)}
              onBlur={onBlur(name)}
              style={styles.fieldValueNotes}
              value={value}
              multiline={true}
              numberOfLines={3}
            />
        </View>
        {errors[name] && <Text style={styles.fieldError}>{errors[name]}</Text>}
      </View>
    );
  }
  else {
    return (
      <View style={stylesCommon.rowContainer}>
        <View style={stylesCommon.row}>
          <View style={stylesCommon.fixedWidthSide}>
            <Text style={styles.fieldLabel}>{props.label}</Text>
          </View>
          <View style={stylesCommon.fillWidthSide}>
            <TextInput
              onChangeText={onChange(name)}
              onBlur={onBlur(name)}
              style={styles.fieldValue}
              value={value}
            />
          </View>
        </View>
        {errors[name] && <Text style={styles.fieldError}>{errors[name]}</Text>}
      </View>
    );
  }
};

TextInputField.propTypes = {
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

export default TextInputField;