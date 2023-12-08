import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import styles from './ui.styles';
import {setNotebookPageVisible} from '../../notebook-panel/notebook.slice';
import {PAGE_KEYS} from '../page.constants';

const ReturnToOverviewButton = () => {
  const dispatch = useDispatch();

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
        onPress={() => dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW))}
      />
    </View>
  );
};

export default ReturnToOverviewButton;
