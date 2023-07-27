import React from 'react';
import {Switch, Text, View} from 'react-native';

import {Icon} from 'react-native-elements';

import * as themes from '../../shared/styles.constants';
import {formStyles} from './index';

const AcknowledgeInput = (props) => {
  return (
    <React.Fragment>
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start'}}>
        <View>
          <Switch
            value={props.value}
            onValueChange={bool => props.setFieldValue(props.name, bool)}
          />
        </View>
        <View style={[formStyles.fieldLabelContainer, {flex: 1}]}>
          <Text style={formStyles.fieldLabel}>{props.label}</Text>
          {props.placeholder && (
            <Icon
              name={'information-circle-outline'}
              type={'ionicon'}
              color={themes.PRIMARY_ACCENT_COLOR}
              onPress={() => props.onShowFieldInfo(props.label, props.placeholder)}
            />
          )}
        </View>
      </View>
    </React.Fragment>
  );
};

export default AcknowledgeInput;
