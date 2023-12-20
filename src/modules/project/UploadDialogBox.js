import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import * as ProjectActions from './project.constants';
import overlayStyles from '../home/overlays/overlay.styles';

const UploadDialogBox = (props) => {
  return (
    <Overlay
      animationType={'fade'}
      overlayStyle={overlayStyles.overlayContainer}
      backdropStyle={overlayStyles.backdropStyles}
      isVisible={props.visible}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>{props.dialogTitle}</Text>
      </View>
      <View style={overlayStyles.overlayContent}>
        {props.children}
      </View>
      <View style={overlayStyles.buttonContainer}>
        <Button
          title={props.buttonText.toUpperCase() || 'OK'}
          type={'clear'}
          titleStyle={props.disabled ? overlayStyles.disabledButtonText : overlayStyles.buttonText}
          disabled={props.disabled}
          onPress={() => props.onPress(ProjectActions.BACKUP_TO_SERVER)}
        />
        <Button
          title={'CANCEL'}
          type={'clear'}
          titleStyle={overlayStyles.buttonText}
          onPress={props.cancel}
        />
      </View>
    </Overlay>
  );
};

export default UploadDialogBox;
