import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import homeStyles from '../../modules/home/home.style';
import styles from '../../shared/common.styles';

const DeleteConformationDialogBox = (props) => {
  return (
    <Overlay
      animationType={'fade'}
      isVisible={props.visible}
      overlayStyle={[homeStyles.dialogBox, styles.dialogBox, {position: 'absolute', top: '25%'}]}
    >
      <View style={[homeStyles.dialogTitleContainer, styles.dialogTitle]}>
        <Text style={[homeStyles.dialogTitleText, styles.dialogTitleText]}>{props.title}</Text>
      </View>
      <View style={styles.dialogContent}>
        {props.children}
      </View>
      <Button
        title={'Delete'}
        type={'clear'}
        onPress={props.delete}
        disabled={props.deleteDisabled}
      />
      <Button
        title={'OK'}
        type={'Cancel'}
        onPress={props.cancel}
        disabled={props.cancelDisabled}
      />
    </Overlay>
  );
};

export default DeleteConformationDialogBox;
