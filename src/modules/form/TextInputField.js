import React from 'react';
import {Alert, Text, TextInput, View} from 'react-native';

import PropTypes from 'prop-types';
import {Icon} from 'react-native-elements';

import stylesCommon from '../../shared/common.styles';
import * as themes from '../../shared/styles.constants';
import {formStyles} from '../form';

const TextInputField = ({
                          field: {name, onBlur, onChange, value},
                          form: {errors, touched},
                          onMyChange, ...props
                        }) => {

  if (props.appearance === 'multiline') {
    return (
      <View style={formStyles.notesFieldContainer}>
        <View style={formStyles.notesFieldLabelContainer}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={formStyles.fieldLabel}>{props.label}</Text>
            {props.placeholder && (
              <Icon
                name={'ios-information-circle-outline'}
                type={'ionicon'}
                color={themes.PRIMARY_ACCENT_COLOR}
                onPress={() => Alert.alert(props.label, props.placeholder)}
                containerStyle={{paddingRight: 5}}
              />
            )}
          </View>
        </View>
        <View style={formStyles.notesFieldValueContainer}>
          <TextInput
            onChangeText={onMyChange && typeof onMyChange === 'function' ? val => onMyChange(name, val) : onChange(
              name)}
            onBlur={onBlur(name)}
            style={formStyles.notesFieldValue}
            value={value}
            multiline={true}
            numberOfLines={3}
            placeholder={props.placeholder}
          />
        </View>
        {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
      </View>
    );
  }
  else {
    return (
      <View style={stylesCommon.rowContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={formStyles.fieldLabel}>{props.label}</Text>
          {props.placeholder && (
            <Icon
              name={'ios-information-circle-outline'}
              type={'ionicon'}
              color={themes.PRIMARY_ACCENT_COLOR}
              onPress={() => Alert.alert(props.label, props.placeholder)}
              containerStyle={{paddingRight: 5}}
            />
          )}
        </View>
        <TextInput
          onChangeText={onMyChange && typeof onMyChange === 'function' ? val => onMyChange(name, val) : onChange(name)}
          onBlur={onBlur(name)}
          style={formStyles.fieldValue}
          value={value}
          placeholder={props.placeholder}
        />
        {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
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
    //touched: PropTypes.object.isRequired,
  }).isRequired,
};

export default TextInputField;
