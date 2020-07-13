import React from 'react';

import {ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {isEmpty, padWithLeadingZeros, toTitleCase} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {labelDictionary} from '../form';

// Render a measurement item in a list
const MeasurementItem = (props) => {

  const getLabel = (key) => {
    const measurementsDictionary = Object.values(labelDictionary.measurement).reduce((acc, form) => ({...acc, ...form}),
      {});
    return measurementsDictionary[key] || key.replace(/_/g, ' ');
  };

  const getTypeText = (item) => {
    const firstOrderClassFields = ['feature_type', 'type'];
    const secondOrderClassFields = ['other_feature', 'vorticity', 'bedding_type', 'contact_type',
      'foliation_type', 'fracture_type', 'vein_type', 'fault_or_sz_type', 'strat_type', 'intrusive_body_type',
      'injection_type', 'fracture_zone', 'fault_or_sz', 'damage_zone', 'alteration_zone', 'enveloping_surface'];
    let firstOrderClass = firstOrderClassFields.find(firstOrderClassField => item[firstOrderClassField]);
    let secondOrderClass = secondOrderClassFields.find(secondOrderClassField => item[secondOrderClassField]);
    let firstOrderClassLabel = firstOrderClass ? toTitleCase(getLabel(item[firstOrderClass])) : 'Unknown';
    firstOrderClassLabel = firstOrderClassLabel.replace('Orientation', 'Feature');
    if (firstOrderClassLabel === 'Tabular Feature') firstOrderClassLabel = 'Planar Feature (TZ)';
    const secondOrderClassLabel = secondOrderClass && getLabel(item[secondOrderClass]).toUpperCase();

    // Is an associated orientation on an associated list
    if (props.isAssociatedList && props.isAssociatedItem) {
      return 'Associated ' + firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '');
    }
    // Doesn't have associated orientation(s) or is the main orientation on an associated list
    else if (!item.associated_orientation || (props.isAssociatedList && !props.isAssociatedItem)) {
      return firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '');
    }
    // Has associated orientation(s)
    else if (item.type === 'planar_orientation' || item.type === 'tabular_orientation') {
      return firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '') + ' + Associated Linear Feature(s)';
    }
    else {
      return firstOrderClassLabel + (secondOrderClass ? ' - ' + secondOrderClassLabel : '') + ' + Associated Planar Feature(s)';
    }
  };

  const getMeasurementText = (item) => {
    if (item.type === 'planar_orientation' || item.type === 'tabular_orientation') {
      return (isEmpty(item.strike) ? '?' : padWithLeadingZeros(item.strike, 3)) + '/' +
        (isEmpty(item.dip) ? '?' : padWithLeadingZeros(item.dip, 2));
    }
    if (item.type === 'linear_orientation') {
      return (isEmpty(item.plunge) ? '?' : padWithLeadingZeros(item.plunge, 2)) + '\u2192' +
        (isEmpty(item.trend) ? '?' : padWithLeadingZeros(item.trend, 3));
    }
    return '?';
  };

  return (
    <React.Fragment>
      {typeof (props.item.item) !== 'undefined' &&
      <ListItem
        containerStyle={props.selectedIds.includes(
          props.item.item.id) ? commonStyles.listItemInverse : commonStyles.listItem}
        contentContainerStyle={{maxWidth: 75}}
        key={props.item.item.id}
        onPress={() => props.onPress()}
        pad={5}
        title={getMeasurementText(props.item.item)}
        titleStyle={props.selectedIds.includes(
          props.item.item.id) ? commonStyles.listItemTitleInverse : commonStyles.listItemTitle}
        rightContentContainerStyle={{alignItems: 'flex-start'}}
        rightTitle={getTypeText(props.item.item)}
        rightTitleStyle={props.selectedIds.includes(
          props.item.item.id) ? commonStyles.listItemRightTitleInverse : commonStyles.listItemRightTitle}
        rightIcon={{
          name: 'ios-information-circle-outline',
          type: 'ionicon',
          color: props.selectedIds.includes(
            props.item.item.id) ? themes.SECONDARY_BACKGROUND_COLOR : themes.PRIMARY_ACCENT_COLOR,
        }}
        chevron={{
          name: 'right',
          type: 'antdesign',
          color: themes.PRIMARY_BACKGROUND_COLOR,
          size: 16,
        }}
      />
      }
    </React.Fragment>
  );
};

export default MeasurementItem;
