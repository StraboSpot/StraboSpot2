import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import homeStyles from '../../modules/home/home.style';
import commonStyles from '../common.styles';
import styles from './../../modules/project/project.styles';

const StandardModal = (props) => {
  return (
    <Overlay
      animationType={'fade'}
      isVisible={props.visible}
      overlayStyle={[homeStyles.dialogBox, {width: props.width || 275}]}
      onBackdropPress={props.onTouchOutside}
    >
      <View style={commonStyles.overlayTitleContainer}>
        <Text style={commonStyles.overlayTitleText}>{props.dialogTitle}</Text>
      </View>
      <View style={styles.dialogContent}>
        {props.children}
      </View>
      {props.footerButtonsVisible && (
        <View style={commonStyles.overlayButtonContainer}>
          <Button
            title={props.rightButtonText || 'OK'}
            type={'clear'}
            titleStyle={commonStyles.overlayButtonText}
            onPress={props.onPress}
          />
          <Button
            title={props.leftButtonText || 'Cancel'}
            titleStyle={commonStyles.overlayButtonText}
            type={'clear'}
            onPress={props.close}
          />
        </View>
      )}
    </Overlay>
  );
};

export default StandardModal;
