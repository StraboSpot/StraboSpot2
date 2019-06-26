import React from 'react';
import {Text, View} from 'react-native';
import {Button} from 'react-native-elements/src/index';
import modalStyle from "./modal.style";

const modalView = (props) => {
  return (
    <View style={[modalStyle.modalContainer, props.modalStyle]}>
      <View style={modalStyle.modalTop}>
        <Button
          titleStyle={{color: 'blue', fontSize: 16}}
          title={props.buttonTitleRight}
          type={'clear'}
          onPress={props.onPress}
        />
        <Text style={[modalStyle.textStyle, props.textStyle]}>{props.children}</Text>
        <Button
          titleStyle={{color: 'blue', fontSize: 16}}
          title={'Close'}
          type={'clear'}
          onPress={props.close}
        />
      </View>
      <View style={props.style}>
        {props.component}
      </View>
    </View>
  )
};

export default modalView;
