import React from 'react';
import {Text, View} from 'react-native';
import {Button} from 'react-native-elements/src/index';
import modalStyle from "./modal.style";

const modalView = (props) => {
  return (
    <View style={[modalStyle.modalContainer, props.modalContainer]}>
      <View style={modalStyle.modalTop}>
        <View style={modalStyle.navButtonsContainer}>
          <View style={modalStyle.rightContainer}>
            <Button
              titleStyle={{color: 'blue', fontSize: 14}}
              title={'Close'}
              type={'clear'}
              onPress={props.close}
            />
          </View>
        </View>
        <View style={modalStyle.textContainer}>
          <Text style={[modalStyle.textStyle, props.textStyle]}>{props.children}</Text>
        </View>
      </View>
      <View style={props.style}>
        {props.component}
      </View>
      {/*<View style={modalStyle.modalBottom}/>*/}
    </View>
  )
};

export default modalView;
