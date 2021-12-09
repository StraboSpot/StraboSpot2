import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';

import {toTitleCase} from '../../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR, PRIMARY_BACKGROUND_COLOR} from '../../../shared/styles.constants';
import IconButton from '../../../shared/ui/IconButton';
import {formStyles, useFormHook} from '../../form';
import {FOLD_GEOMETRY_KEYS, FOLD_ICONS} from './';

const FoldGeometryChoices = (props) => {
  const [useForm] = useFormHook();

  const onGeometryChoiceButtonPress = (key, value) => {
    let updatedFormData = JSON.parse(JSON.stringify(props.formProps.values));
    if (updatedFormData[key] && updatedFormData[key] === value) delete updatedFormData[key];
    else updatedFormData[key] = value;
    props.formProps.setValues(updatedFormData);
  };

  // Only need this TempIconButton until we get the icons for Hinge Shape
  const TempIconButton = ({fieldKey, value}) => (
    <Button
      containerStyle={{padding: 2.5}}
      buttonStyle={[formStyles.formButtonSmall, {
        height: 49,
        width: 49,
        backgroundColor: props.formProps.values[fieldKey] === value ? PRIMARY_ACCENT_COLOR : PRIMARY_BACKGROUND_COLOR,
        padding: 0,
      }]}
      title={toTitleCase(value)}
      titleProps={{
        style: [formStyles.formButtonTitle, {fontSize: 10, textAlign: 'center'}],
        numberOfLines: 2,
        textAlign: 'center',
      }}
      type={'outline'}
      onPress={() => onGeometryChoiceButtonPress(fieldKey, value)}
    />
  );

  return FOLD_GEOMETRY_KEYS.map(key => {
    const foldGeometryField = useForm.getRelevantFields(props.survey, key)[0];
    const foldGeometryChoices = useForm.getChoicesByKey(props.survey, props.choices, key);
    return (
      <View style={{padding: 10}}>
        {foldGeometryField.label && (
          <View style={[formStyles.fieldLabelContainer, {paddingLeft: 10}]}>
            <Text style={formStyles.fieldLabel}>{foldGeometryField.label}</Text>
          </View>
        )}
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap'}}>
          {foldGeometryChoices.map(c => {
            return (
              FOLD_ICONS[key] && FOLD_ICONS[key].DEFAULT && FOLD_ICONS[key].DEFAULT[c.name] && FOLD_ICONS[key].PRESSED
              && FOLD_ICONS[key].PRESSED[c.name] ? (
                  <IconButton
                    source={props.formProps.values[key] === c.name ? FOLD_ICONS[key].PRESSED[c.name] : FOLD_ICONS[key].DEFAULT[c.name]}
                    imageStyle={{margin: -5}}
                    onPress={() => onGeometryChoiceButtonPress(key, c.name)}
                  />
                )
                : <TempIconButton fieldKey={key} value={c.name}/>
            );
          })}
        </View>
        <Text style={{paddingLeft: 10}}>
          {foldGeometryChoices.find(c => c.name === props.formProps.values[key])?.label}
        </Text>
      </View>
    );
  });
};

export default FoldGeometryChoices;
