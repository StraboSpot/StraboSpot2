import React from 'react';
import {Text, TextInput, View} from 'react-native';

import {Button, Icon} from 'react-native-elements';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {formStyles} from '../form';

const TextInputField = ({
                          field: {name, onBlur, onChange, value},
                          form: {errors, touched},
                          onMyChange, ...props
                        }) => {

  return (
    <>
      {props.label && (
        <View style={formStyles.fieldLabelContainer}>
          <Text style={formStyles.fieldLabel}>{props.label}</Text>
          {(name === 'Sample_IGSN' && isEmpty(value)) ? (
              <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', width: '50%'}}>
                <Button style={{marginEnd: 5}}
                  title="Register IGSN"
                        titleStyle={{fontSize: 11}}
                        onPress={props.IGSN}
                  containerStyle={{marginRight: 5}}
                />
                <Icon
                  name={'information-circle-outline'}
                  type={'ionicon'}
                  color={'green'}
                  // onPress={props.IGSN}
                />
              </View>
          ) : (
            props.placeholder && (
            <Icon
              name={'information-circle-outline'}
              type={'ionicon'}
              color={themes.PRIMARY_ACCENT_COLOR}
              onPress={() => props.onShowFieldInfo(props.label, props.placeholder)}
            />
          )
          )}
        </View>
      )}
      <TextInput
        onChangeText={onMyChange && typeof onMyChange === 'function' ? val => onMyChange(name, val) : onChange(name)}
        onBlur={onBlur(name)}
        style={props.appearance === 'multiline' ? {...formStyles.fieldValue, ...formStyles.fieldValueMultiline}
          : props.appearance === 'full' ? {...formStyles.fieldValue, ...formStyles.fieldValueFull}
            : formStyles.fieldValue}
        value={value || ''}
        placeholder={props.placeholder}
        placeholderTextColor={themes.MEDIUMGREY}
        multiline={props.appearance === 'multiline' || props.appearance === 'full'}
        autoFocus={props.autoFocus}
        autoCapitalize={props.autoCapitalize}
        keyboardType={props.keyboardType}
      />
      {errors[name] && <Text style={formStyles.fieldError}>{errors[name]}</Text>}
    </>
  );
};

export default TextInputField;
