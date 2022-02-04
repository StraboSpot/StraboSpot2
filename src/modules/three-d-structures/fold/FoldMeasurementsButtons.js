import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import {isEmpty, padWithLeadingZeros} from '../../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR, SECONDARY_BACKGROUND_COLOR} from '../../../shared/styles.constants';
import {COMPASS_TOGGLE_BUTTONS} from '../../compass/compass.constants';
import {setCompassMeasurementTypes} from '../../compass/compass.slice';
import {formStyles, useFormHook} from '../../form';
import {FOLD_MEASUREMENTS_GROUP_KEYS} from './';

const FoldMeasurementsButtons = (props) => {
  const dispatch = useDispatch();

  const [useForm] = useFormHook();

  const groupFields = Object.keys(FOLD_MEASUREMENTS_GROUP_KEYS).map(k => props.survey.find(f => f.name === k));

  const addFoldMeasurement = (groupField) => {
    props.setIsFoldMeasurementsModalVisible(true);
    props.setFoldMeasurementsGroupField(groupField);
    if (groupField.name === 'group_xf0sv21') dispatch(setCompassMeasurementTypes([COMPASS_TOGGLE_BUTTONS.LINEAR]));
    else dispatch(setCompassMeasurementTypes([COMPASS_TOGGLE_BUTTONS.PLANAR]));
    // dispatch(setModalVisible({modal: MODAL_KEYS.NOTEBOOK.MEASUREMENT}));
  };

  const isGroupEmpty = (groupField) => {
    const relevantFields = useForm.getGroupFields(props.survey, groupField.name);
    return !relevantFields.some(f => !isEmpty(props.formProps.values[f.name]));
  };

  const buttonText = (field) => {
    const getValueText = () => {
      const values = props.formProps.values;
      const groupKeys = FOLD_MEASUREMENTS_GROUP_KEYS[field.name];
      if (Object.keys(groupKeys).includes('strike')) {
        const strike = values[groupKeys.strike];
        const dip = values[groupKeys.dip];
        return (isEmpty(strike) ? '?' : padWithLeadingZeros(strike, 3)) + '/'
          + (isEmpty(dip) ? '?' : padWithLeadingZeros(dip, 2));
      }
      else {
        const plunge = values[groupKeys.plunge];
        const trend = values[groupKeys.trend];
        return (isEmpty(plunge) ? '?' : padWithLeadingZeros(plunge, 2)) + '\u2192'
          + (isEmpty(trend) ? '?' : padWithLeadingZeros(trend, 3));
      }
    };

    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text
          style={[isGroupEmpty(field) ? formStyles.formButtonTitle : formStyles.formButtonSelectedTitle,
            {fontSize: 10, textAlign: 'center'}]}
        >
          {field.label}
        </Text>
        {!isGroupEmpty(field) && (
          <Text style={[formStyles.formButtonSelectedTitle, {fontSize: 10, textAlign: 'center', fontWeight: 'bold'}]}>
            {getValueText()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', paddingLeft: 10, paddingRight: 10}}>
      {groupFields.map(field => {
        return (
          <Button
            containerStyle={{flex: 1, padding: 2}}
            buttonStyle={[formStyles.formButtonSmall, {
              height: 60,
              backgroundColor: isGroupEmpty(field) ? SECONDARY_BACKGROUND_COLOR : PRIMARY_ACCENT_COLOR,
              padding: 1,
            }]}
            title={() => buttonText(field)}
            type={'outline'}
            onPress={() => addFoldMeasurement(field)}
          />
        );
      })}
    </View>
  );
};

export default FoldMeasurementsButtons;
