import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';

import styles from '../../shared/ui/ui.styles';

const SaveAndCancelButtons = ({cancel, save, getIsDisabled}) => {
  return (
    <View style={styles.navButtonsContainer}>
      <View style={styles.leftContainer}>
        {cancel && (
          <Button
            titleStyle={styles.buttonText}
            title={'Cancel'}
            type={'clear'}
            onPress={cancel}
          />
        )}
        {save && (
          <Button
            titleStyle={styles.buttonText}
            title={'Save'}
            type={'clear'}
            onPress={save}
            disabled={getIsDisabled}
          />
        )}
      </View>
    </View>
  );
};

export default SaveAndCancelButtons;
