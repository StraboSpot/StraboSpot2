import React from 'react';
import {Text, TextInput, View} from 'react-native';

import {Icon} from 'react-native-elements';

import * as themes from '../../shared/styles.constants';
import {formStyles} from '../form';

const TextInputField = ({
                          field: {name, onBlur, onChange, value},
                          form: {errors, touched},
                          appearance,
                          autoCapitalize,
                          autoFocus,
                          keyboardType,
                          label,
                          onMyChange,
                          onShowFieldInfo,
                          placeholder,
                        }) => {

  return (
    <>
      {label && (
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
      )}
      <TextInput
        onChangeText={onMyChange && typeof onMyChange === 'function' ? val => onMyChange(name, val) : onChange(name)}
        onBlur={onBlur(name)}
        style={appearance === 'multiline' ? {...formStyles.fieldValue, ...formStyles.fieldValueMultiline}
          : appearance === 'full' ? {...formStyles.fieldValue, ...formStyles.fieldValueFull}
            : formStyles.fieldValue}
        value={value || ''}
        placeholder={placeholder}
        placeholderTextColor={themes.MEDIUMGREY}
        multiline={appearance === 'multiline' || appearance === 'full'}
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
      {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
    </>
  );
};

export default TextInputField;
