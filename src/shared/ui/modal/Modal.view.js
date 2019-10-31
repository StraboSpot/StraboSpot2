import React from 'react';
import {Text, View} from 'react-native';
import {Button} from 'react-native-elements/src/index';

// Styles
import modalStyle from "./modal.style";
import * as themes from '../../styles.constants';

const modalView = (props) => {
  return (
    <View style={modalStyle.modalContainer}>
      <View style={modalStyle.modalTop}>
        <Button
          titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
          title={props.buttonTitleRight}
          type={'clear'}
          onPress={props.onPress}
        />
        <Text style={[modalStyle.textStyle, props.textStyle]}>{props.children}</Text>
        <Button
          titleStyle={{color: themes.PRIMARY_ACCENT_COLOR, fontSize: 16}}
          title={'Close'}
          type={'clear'}
          onPress={() => props.close()}
        />
      </View>
      <View style={props.style}>
        {props.component}
      </View>
      {/*<View style={modalStyle.modalBottom}/>*/}
    </View>
  )
};

export default modalView;
