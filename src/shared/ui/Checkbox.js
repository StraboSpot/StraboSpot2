import React from 'react';

import {CheckBox} from 'react-native-elements';

import styles from './ui.styles';

const DefaultCheckBox = (props) => {

  return (
    <React.Fragment>
      <CheckBox
        title={props.title}
        textStyle={props.textStyle}
        checked={props.checked}
        checkedColor={props.checkedColor}
        iconType={'ionicon'}
        iconRight={props.iconRight}
        checkedIcon='checkbox-outline'
        uncheckedIcon='square-outline'
        containerStyle={[styles.defaultCheckBox, props.containerStyle]}
        onPress={props.onPress}
      />
    </React.Fragment>
  );
};

export default DefaultCheckBox;
