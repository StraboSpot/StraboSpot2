import React from 'react';
import {Alert, Text, TextInput, View} from 'react-native';

import PropTypes from 'prop-types';
import {Icon} from 'react-native-elements';

import stylesCommon from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {formStyles} from '../form';

const NumberInputField = ({
                            field: {name, onBlur, onChange, value},
                            form: {errors, touched},
                            onMyChange, ...props
                          }) => {

  const getDisplayValue = () => {
    if (!isEmpty(value)) return value.toString();
    return value;
  };

  return (
    <View style={stylesCommon.rowContainer}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={formStyles.fieldLabel}>{props.label}</Text>
        {props.placeholder && (
          <Icon
            name={'ios-information-circle-outline'}
            type={'ionicon'}
            color={themes.PRIMARY_ACCENT_COLOR}
            onPress={() => props.onShowFieldInfo(props.label, props.placeholder)}
            containerStyle={{paddingRight: 5}}
          />
        )}
      </View>
      <TextInput
        onChangeText={onMyChange && typeof onMyChange === 'function' ? val => onMyChange(name, val) : onChange(name)}
        onBlur={onBlur(name)}
        style={formStyles.fieldValue}
        value={getDisplayValue()}
        keyboardType={'numeric'}
        placeholder={props.placeholder}
      />
      {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
    </View>
  );
};

NumberInputField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    //value: PropTypes.number,
  }).isRequired,
  form: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    touched: PropTypes.object.isRequired,
  }).isRequired,
};

export default NumberInputField;
