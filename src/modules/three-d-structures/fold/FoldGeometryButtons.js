import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';

import {toTitleCase} from '../../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR, SECONDARY_BACKGROUND_COLOR} from '../../../shared/styles.constants';
import IconButton from '../../../shared/ui/IconButton';
import {formStyles} from '../../form';
import {FOLD_GEOMETRY_KEYS, FOLD_ICONS} from './';

const FoldGeometryButtons = (props) => {

  const renderFoldGeometryIcons = () => {
    let foldGeometryData = [];
    FOLD_GEOMETRY_KEYS.forEach(key => {
      if (props.formProps?.values[key]) {
        const iconSource = FOLD_ICONS[key] && FOLD_ICONS[key].PRESSED
        && FOLD_ICONS[key].PRESSED[props.formProps?.values[key]]
          ? <IconButton source={FOLD_ICONS[key].PRESSED[props.formProps?.values[key]]} imageStyle={{margin: -5}}/>
          : props.formProps?.values[key] ? <TempIconButton title={props.formProps?.values[key]}/>
            : null;
        if (iconSource) foldGeometryData.push(iconSource);
      }
    });
    return foldGeometryData;
  };

  const FoldGeometryEditButton = () => (
    <Button
      containerStyle={{paddingTop: 0}}
      buttonStyle={[formStyles.formButtonSmall, {
        height: 49,
        width: 49,
        backgroundColor: SECONDARY_BACKGROUND_COLOR,
        padding: 0,
      }]}
      title={'Edit\nGeometry'}
      titleProps={{
        style: [formStyles.formButtonTitle, {fontSize: 10, textAlign: 'center'}],
        numberOfLines: 2,
        textAlign: 'center',
      }}
      type={'outline'}
      onPress={() => props.setChoicesViewKey('fold_geometry')}
    />
  );

  // Only need this TempIconButton until we get the icons for Hinge Shape
  const TempIconButton = ({title}) => (
    <Button
      containerStyle={{padding: 2.5}}
      buttonStyle={[formStyles.formButtonSmall, {
        height: 49,
        width: 49,
        backgroundColor: PRIMARY_ACCENT_COLOR,
        padding: 1,
      }]}
      title={toTitleCase(title)}
      titleProps={{
        style: [formStyles.formButtonTitle, {fontSize: 10, textAlign: 'center'}],
        numberOfLines: 2,
        textAlign: 'center',
      }}
      type={'outline'}
    />
  );

  return (
    <React.Fragment>
      <View
        style={{flex: 1, flexDirection: 'row', alignItems: 'center', padding: 10, paddingTop: 2.5, paddingBottom: 5}}
      >
        <View style={{flex: 3, flexDirection: 'row', justifyContent: 'flex-start'}}>{renderFoldGeometryIcons()}</View>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
          <FoldGeometryEditButton/>
        </View>
      </View>
    </React.Fragment>
  );

};

export default FoldGeometryButtons;
