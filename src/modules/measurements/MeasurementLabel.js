import React from 'react';
import {Text} from 'react-native';

import {FIRST_ORDER_CLASS_FIELDS, SECOND_ORDER_CLASS_FIELDS} from './measurements.constants';
import useMeasurementsHook from './useMeasurements';
import {isEmpty, padWithLeadingZeros, toTitleCase} from '../../shared/Helpers';
import {useForm} from '../form';

const MeasurementLabel = ({
                            isDetail,
                            item,
                          }) => {
  const useMeasurements = useMeasurementsHook();
  const {getLabel} = useForm();

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
      ? toTitleCase(getLabel(item[firstOrderClass], ['measurement']))
      : 'Unknown';
    firstOrderClassLabel = firstOrderClassLabel.replace('Orientation', 'Feature');
    if (firstOrderClassLabel === 'Tabular Feature') firstOrderClassLabel = 'Planar Feature (TZ)';
    const secondOrderClassLabel = secondOrderClass
      && useMeasurements.getMeasurementLabel(item[secondOrderClass]).toUpperCase();
    return firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '');
  };

  return (
    <>
      <Text>{getMeasurementText(item)} {getTypeText(item)}</Text>
      {!isDetail && item.associated_orientation
        && item.associated_orientation.map((ao) => {
          return <Text key={JSON.stringify(ao)}>{'\n'}{getMeasurementText(ao)} {getTypeText(ao)}</Text>;
        })
      }
    </>
  );
};

export default MeasurementLabel;
