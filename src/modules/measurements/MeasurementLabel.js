import React from 'react';
import {Text} from 'react-native';

import {isEmpty, padWithLeadingZeros, toTitleCase} from '../../shared/Helpers';
import useFormHook from '../form/useForm';
import {FIRST_ORDER_CLASS_FIELDS, SECOND_ORDER_CLASS_FIELDS} from './measurements.constants';
import useMeasurementsHook from './useMeasurements';

const MeasurementLabel = (props) => {
  const [useMeasurements] = useMeasurementsHook();
  const [useForm] = useFormHook();

  const getMeasurementText = (item) => {
    let measurementText = '';
    if (item.type === 'planar_orientation' || item.type === 'tabular_orientation') {
      measurementText += (isEmpty(item.strike) ? '?' : padWithLeadingZeros(item.strike, 3)) + '/'
        + (isEmpty(item.dip) ? '?' : padWithLeadingZeros(item.dip, 2));
    }
    if (item.type === 'linear_orientation') {
      measurementText += (isEmpty(item.plunge) ? '?' : padWithLeadingZeros(item.plunge, 2)) + '\u2192'
        + (isEmpty(item.trend) ? '?' : padWithLeadingZeros(item.trend, 3));
    }
    return measurementText === '' ? '?' : measurementText;
  };

  const getTypeText = (item) => {
    let firstOrderClass = FIRST_ORDER_CLASS_FIELDS.find(firstOrderClassField => item[firstOrderClassField]);
    let secondOrderClass = SECOND_ORDER_CLASS_FIELDS.find(secondOrderClassField => item[secondOrderClassField]);
    let firstOrderClassLabel = firstOrderClass
      ? toTitleCase(useForm.getLabel(item[firstOrderClass], ['measurement']))
      : 'Unknown';
    firstOrderClassLabel = firstOrderClassLabel.replace('Orientation', 'Feature');
    if (firstOrderClassLabel === 'Tabular Feature') firstOrderClassLabel = 'Planar Feature (TZ)';
    const secondOrderClassLabel = secondOrderClass && useMeasurements.getLabel(item[secondOrderClass]).toUpperCase();
    return firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '');
  };

  return (
    <React.Fragment>
      <Text>{getMeasurementText(props.item)} {getTypeText(props.item)}</Text>
      {!props.isDetail && props.item.associated_orientation
        && props.item.associated_orientation.map((ao) => {
          return <Text key={JSON.stringify(ao)}>{'\n'}{getMeasurementText(ao)} {getTypeText(ao)}</Text>;
        })
      }
    </React.Fragment>
  );
};

export default MeasurementLabel;
