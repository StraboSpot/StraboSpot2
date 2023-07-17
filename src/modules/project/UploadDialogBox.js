import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import * as ProjectActions from './project.constants';
import styles from './project.styles';

const UploadDialogBox = (props) => {
  return (
    <Overlay
      animationType={'fade'}
      overlayStyle={[commonStyles.dialogBox, {width: 275}]}
      isVisible={props.visible}
    >
      <View style={[commonStyles.overlayTitleContainer, styles.dialogTitleContainer]}>
        <Text style={[commonStyles.overlayTitleText, styles.dialogTitleText]}>{props.dialogTitle}</Text>
      </View>
      <View style={styles.dialogContent}>
        {props.children}
      </View>
      <View style={commonStyles.overlayButtonContainer}>
        <Button
          title={props.buttonText.toUpperCase() || 'OK'}
          buttonStyle={styles.dialogButton}
          titleStyle={props.disabled ? styles.dialogDisabledButtonText : styles.dialogButtonText}
          disabled={props.disabled}
          onPress={() => props.onPress(ProjectActions.BACKUP_TO_SERVER)}
        />
        <Button
          title={'CANCEL'}
          buttonStyle={styles.dialogButton}
          titleStyle={[styles.dialogButtonText]}
          onPress={props.cancel}
        />
      </View>
    </Overlay>
  );
};

export default UploadDialogBox;
