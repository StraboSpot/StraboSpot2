import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-elements';

//Styles
import styles from './ui.styles';

const returnToOverviewButton = props => {
  return (
    <View style={styles.navButtonsContainer}>
      <Button
        icon={{
          name: 'arrow-back',
          size: 20,
          color: 'black',
        }}
        containerStyle={styles.backButton}
        titleStyle={styles.buttonText}
        title={'Return to Overview'}
        type={'clear'}
        onPress={() => props.onPress()}
      />
    </View>
  );
};

export default returnToOverviewButton;
