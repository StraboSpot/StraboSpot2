import React from 'react';
import {Text} from 'react-native';

import {FIRST_ORDER_CLASS_FIELDS, SECOND_ORDER_CLASS_FIELDS} from './measurements.constants';
import useMeasurements from './useMeasurements';
import {isEmpty, padWithLeadingZeros, toTitleCase} from '../../shared/Helpers';
import {useForm} from '../form';

const MeasurementLabel = ({isDetail, item}) => {
  const {getMeasurementLabel} = useMeasurements();
  const {getLabel} = useForm();

  const getMeasurementText = (measurement) => {
    let measurementText = '';
    if (measurement.type === 'planar_orientation' || measurement.type === 'tabular_orientation') {
      measurementText += (isEmpty(measurement.strike) ? '?' : padWithLeadingZeros(measurement.strike, 3)) + '/'
        + (isEmpty(measurement.dip) ? '?' : padWithLeadingZeros(measurement.dip, 2));
    }
    if (measurement.type === 'linear_orientation') {
      measurementText += (isEmpty(measurement.plunge) ? '?' : padWithLeadingZeros(measurement.plunge, 2)) + '\u2192'
        + (isEmpty(measurement.trend) ? '?' : padWithLeadingZeros(measurement.trend, 3));
    }
    return measurementText === '' ? '?' : measurementText;
  };

  const getTypeText = (measurement) => {
    let firstOrderClass = FIRST_ORDER_CLASS_FIELDS.find(firstOrderClassField => measurement[firstOrderClassField]);
    let secondOrderClass = SECOND_ORDER_CLASS_FIELDS.find(secondOrderClassField => measurement[secondOrderClassField]);
    let firstOrderClassLabel = firstOrderClass
      ? toTitleCase(getLabel(measurement[firstOrderClass], ['measurement']))
      : 'Unknown';
    firstOrderClassLabel = firstOrderClassLabel.replace('Orientation', 'Feature');
    if (firstOrderClassLabel === 'Tabular Feature') firstOrderClassLabel = 'Planar Feature (TZ)';
    const secondOrderClassLabel = secondOrderClass && getMeasurementLabel(measurement[secondOrderClass]).toUpperCase();
    return firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '');
  };

  return (
    <>
      <Text>{getMeasurementText(item)} {getTypeText(item)}</Text>
      {!isDetail && item.associated_orientation && item.associated_orientation.map((ao) => {
        return <Text key={JSON.stringify(ao)}>{'\n'}{getMeasurementText(ao)} {getTypeText(ao)}</Text>;
      })}
    </>
  );
};

export default MeasurementLabel;
