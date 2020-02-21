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
        iconType={'feather'}
        checkedIcon='check-square'
        uncheckedIcon='square'
        containerStyle={styles.defaultCheckBox}
        onPress={props.onPress}
      />
    </React.Fragment>
  );
};

export default DefaultCheckBox;
