import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import * as ProjectActions from './project.constants';
import overlayStyles from '../home/overlays/overlay.styles';

const UploadDialogBox = ({
                           buttonText,
                           cancel,
                           children,
                           dialogTitle,
                           disabled,
                           onPress,
                           visible,
                         }) => {
  return (
    <Overlay
      animationType={'fade'}
      overlayStyle={overlayStyles.overlayContainer}
      backdropStyle={overlayStyles.backdropStyles}
      isVisible={visible}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>{dialogTitle}</Text>
      </View>
      <View style={overlayStyles.overlayContent}>
        {children}
      </View>
      <View style={overlayStyles.buttonContainer}>
        <Button
          title={buttonText.toUpperCase() || 'OK'}
          type={'clear'}
          titleStyle={disabled ? overlayStyles.disabledButtonText : overlayStyles.buttonText}
          disabled={disabled}
          onPress={() => onPress(ProjectActions.BACKUP_TO_SERVER)}
        />
        <Button
          title={'CANCEL'}
          type={'clear'}
          titleStyle={overlayStyles.buttonText}
          onPress={cancel}
        />
      </View>
    </Overlay>
  );
};

export default UploadDialogBox;
