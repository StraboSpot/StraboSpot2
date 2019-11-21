import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-elements';

// Styles
import styles from './ui.styles';

const saveAndClose = (props) => {
  return (
    <View style={styles.navButtonsContainer}>
      <View style={styles.leftContainer}>
        <Button
          titleStyle={styles.buttonText}
          title={'Cancel'}
          type={'clear'}
          onPress={props.cancel}
        />
        <Button
          titleStyle={styles.buttonText}
          title={'Save'}
          type={'clear'}
          onPress={props.save}
        />
      </View>
    </View>
  );
};

export default saveAndClose;
