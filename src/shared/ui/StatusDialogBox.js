import React, {useRef} from 'react';
import {ScrollView, Text, View} from 'react-native';

import {Overlay} from 'react-native-elements';

import overlayStyles from '../../modules/home/overlay.styles';

const StatusDialogBox = (props) => {
  const scrollView = useRef();

  return (
    <Overlay
      animationType={'fade'}
      isVisible={props.visible}
      onBackdropPress={props.onTouchOutside}
      overlayStyle={overlayStyles.overlayContainer}
    >
      <View style={[overlayStyles.titleContainer, props.titleContainer]}>
        <Text style={[overlayStyles.titleText, props.overlayTitleText]}>{props.title}</Text>
      </View>
      <ScrollView
        ref={scrollView}
        onContentSizeChange={() => scrollView.current.scrollToEnd({animated: true})}
      >
        <View style={[overlayStyles.overlayContent, props.overlayContent]}>
          {props.children}
        </View>
      </ScrollView>
    </Overlay>
  );
};

export default StatusDialogBox;
