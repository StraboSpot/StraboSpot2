import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import overlayStyles from '../../modules/home/overlay.styles';

const DeleteConformationDialogBox = (props) => {
  return (
    <Overlay
      animationType={'fade'}
      isVisible={props.isVisible}
      overlayStyle={overlayStyles.overlayContainer}
      backdropStyle={{backgroundColor: 'transparent'}}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={[overlayStyles.titleText, overlayStyles.importantText]}>{props.title}</Text>
      </View>
      <View style={overlayStyles.overlayContent}>
        {props.children}
      </View>
      <View style={overlayStyles.buttonContainer}>
        <Button
          title={'Delete'}
          titleStyle={overlayStyles.buttonText}
          type={'clear'}
          onPress={props.delete}
        />
        <Button
          title={'Cancel'}
          titleStyle={overlayStyles.buttonText}
          type={'Cancel'}
          onPress={props.cancel}
        />
      </View>
    </Overlay>
  );
};

export default DeleteConformationDialogBox;
