import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import overlayStyles from '../../modules/home/overlays/overlay.styles';

const DeleteConformationDialogBox = ({
                                       cancel,
                                       children,
                                       deleteOverlay,
                                       isVisible,
                                       title,
                                     }) => {
  return (
    <Overlay
      animationType={'fade'}
      isVisible={isVisible}
      overlayStyle={overlayStyles.overlayContainer}
      backdropStyle={{backgroundColor: 'transparent'}}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={[overlayStyles.titleText, overlayStyles.importantText]}>{title}</Text>
      </View>
      <View style={overlayStyles.overlayContent}>
        {children}
      </View>
      <View style={overlayStyles.buttonContainer}>
        <Button
          title={'Delete'}
          titleStyle={overlayStyles.buttonText}
          type={'clear'}
          onPress={deleteOverlay}
        />
        <Button
          title={'Cancel'}
          titleStyle={overlayStyles.buttonText}
          type={'Cancel'}
          onPress={cancel}
        />
      </View>
    </Overlay>
  );
};

export default DeleteConformationDialogBox;
