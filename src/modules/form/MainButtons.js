import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';

import {truncateText} from '../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR, SECONDARY_BACKGROUND_COLOR} from '../../shared/styles.constants';
import {formStyles, useFormHook} from '../form';

const MainButtons = (props) => {
  const [useForm] = useFormHook();

  const mainButttonsText = key => (
    <View style={{flex: 1, alignItems: 'center'}}>
      <Text
        style={props.formProps?.values[key] ? formStyles.formButtonSelectedTitle : formStyles.formButtonTitle}>
        {useForm.getLabel(key, props.formName)}
      </Text>
      {props.formProps?.values[key] && (
        <Text style={[formStyles.formButtonSelectedTitle, {fontWeight: 'bold'}]}>
          {truncateText(useForm.getLabels(props.formProps.values[key], props.formName), 23)}
        </Text>
      )}
    </View>
  );

  return (
    <View
      style={props.mainKeys.length === 1 ? formStyles.fullWidthButtonContainer : formStyles.halfWidthButtonsContainer}>
      {props.mainKeys.map((k) => {
        return (
          <Button
            containerStyle={props.mainKeys.length === 1 ? formStyles.fullWidthButtonContainer : formStyles.halfWidthButtonContainer}
            buttonStyle={[formStyles.formButtonLarge, {
              backgroundColor: props.formProps?.values[k] ? PRIMARY_ACCENT_COLOR : SECONDARY_BACKGROUND_COLOR,
            }]}
            title={() => mainButttonsText(k)}
            type={'outline'}
            onPress={() => props.setChoicesViewKey(k)}
          />
        );
      })}
    </View>
  );
};

export default MainButtons;
