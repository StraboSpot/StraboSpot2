import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import homeStyles from '../home/home.style';
import * as ProjectActions from './project.constants';
import styles from './project.styles';

const UploadDialogBox = (props) => {
  return (
    <Overlay
      animationType={'fade'}
      overlayStyle={[commonStyles.dialogBox, {width: 275}]}
      isVisible={props.visible}
    >
      <View style={[homeStyles.dialogTitleContainer, styles.dialogTitleContainer]}>
        <Text style={[homeStyles.dialogTitleText, styles.dialogTitleText]}>{props.dialogTitle}</Text>
      </View>
      <View style={styles.dialogContent}>
        {props.children}
      </View>
      <Button
        title={'CANCEL'}
        buttonStyle={styles.dialogButton}
        titleStyle={[styles.dialogButtonText, {color: 'red'}]}
        onPress={props.cancel}
      />
      <Button
        title={props.buttonText || 'OK'}
        buttonStyle={styles.dialogButton}
        titleStyle={props.disabled ? styles.dialogDisabledButtonText : styles.dialogButtonText}
        disabled={props.disabled}
        onPress={() => props.onPress(ProjectActions.BACKUP_TO_SERVER)}
      />
    </Overlay>
  );
};

export default UploadDialogBox;
