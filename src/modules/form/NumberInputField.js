import React from 'react';
import {Text, TextInput, View} from 'react-native';

import {Icon} from 'react-native-elements';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {formStyles} from '../form';

const NumberInputField = ({
                            field: {name, onBlur, onChange, value},
                            form: {errors, touched},
                            editable, label, onMyChange, onShowFieldInfo, placeholder,
                          }) => {

  const getDisplayValue = () => {
    if (!isEmpty(value)) return value.toString();
    return value || '';
  };

  return (
    <>
      <View style={formStyles.fieldLabelContainer}>
        <Text style={formStyles.fieldLabel}>{label}</Text>
        {placeholder && (
          <Icon
            name={'information-circle-outline'}
            type={'ionicon'}
            color={themes.PRIMARY_ACCENT_COLOR}
            onPress={() => onShowFieldInfo(label, placeholder)}
          />
        )}
      </View>
      <TextInput
        onChangeText={onMyChange && typeof onMyChange === 'function' ? val => onMyChange(name, val) : onChange(name)}
        onBlur={onBlur(name)}
        style={formStyles.fieldValue}
        value={getDisplayValue()}
        placeholder={placeholder}
        placeholderTextColor={themes.MEDIUMGREY}
        keyboardType={'numeric'}
        editable={editable}
      />
      {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
    </>
  );
};

export default NumberInputField;
