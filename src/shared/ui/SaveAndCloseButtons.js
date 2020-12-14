import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';

import styles from '../../shared/ui/ui.styles';

const saveAndClose = (props) => {
  return (
    <View style={styles.navButtonsContainer}>
      <View style={styles.leftContainer}>
        {props.cancel && (
          <Button
            titleStyle={styles.buttonText}
            title={'Cancel'}
            type={'clear'}
            onPress={props.cancel}
          />
        )}
        {props.save && (
          <Button
            titleStyle={styles.buttonText}
            title={'Save'}
            type={'clear'}
            onPress={props.save}
          />
        )}
      </View>
    </View>
  );
};

export default saveAndClose;
