import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';

const deleteConformation = (props) => {
  return (
    <Overlay
      animationType={'fade'}
      isVisible={props.isVisible}
      overlayStyle={commonStyles.dialogBox}
      backdropStyle={{backgroundColor: 'transparent'}}
    >
      <View style={commonStyles.overlayTitleContainer}>
        <Text style={{...commonStyles.overlayTitleText, color: 'red'}}>{props.title}</Text>
      </View>
      <View style={commonStyles.dialogContent}>
        {props.children}
      </View>
      <View style={commonStyles.overlayButtonContainer}>
        <Button
          title={'Delete'}
          titleStyle={commonStyles.overlayButtonText}
          type={'clear'}
          onPress={props.delete}
        />
        <Button
          title={'Cancel'}
          titleStyle={commonStyles.overlayButtonText}
          type={'Cancel'}
          onPress={props.cancel}
        />
      </View>
    </Overlay>
  );
};

export default deleteConformation;
