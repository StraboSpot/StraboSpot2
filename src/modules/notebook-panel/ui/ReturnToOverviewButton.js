import React from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import {setModalVisible} from '../../home/home.slice';
import {PAGE_KEYS} from '../notebook.constants';
import {setNotebookPageVisible} from '../notebook.slice';
import styles from './ui.styles';

const ReturnToOverviewButton = (props) => {
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
        onPress={() => {
          dispatch(setNotebookPageVisible(PAGE_KEYS.OVERVIEW));
          dispatch(setModalVisible({modal: null}));
        }}
      />
    </View>
  );
};

export default ReturnToOverviewButton;
