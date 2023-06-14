import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import homeStyles from '../../modules/home/home.style';
import styles from './../../modules/project/project.styles';

const StandardModal = (props) => {
  return (
    <Overlay
      animationType={'fade'}
      isVisible={props.visible}
      overlayStyle={[homeStyles.dialogBox, {width: props.width || 275}]}
      onBackdropPress={props.onTouchOutside}
    >
      <View style={[homeStyles.dialogTitleContainer, props.dialogTitleStyle]}>
        <Text style={[homeStyles.dialogTitleText, styles.dialogTitleText]}>{props.dialogTitle}</Text>
      </View>
      <View style={styles.dialogContent}>
        {props.children}
      </View>
      {props.footerButtonsVisible && (
        <React.Fragment>
          <Button
            title={props.rightButtonText || 'OK'}
            onPress={props.onPress}
          />
          <Button
            title={props.leftButtonText || 'Cancel'}
            onPress={props.close}
          />
        </React.Fragment>
      )}
    </Overlay>
  );
};

export default StandardModal;
