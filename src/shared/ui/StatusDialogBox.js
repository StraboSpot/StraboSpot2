import React, {useRef} from 'react';
import {ScrollView, Text, View} from 'react-native';

import {Overlay} from 'react-native-elements';

import homeStyles from '../../modules/home/home.style';
import styles from '../../shared/common.styles';

const StatusDialogBox = (props) => {
  const scrollView = useRef();

  return (
    <React.Fragment>
      <Overlay
        animationType={'fade'}
        isVisible={props.visible}
        onBackdropPress={props.onTouchOutside}
        overlayStyle={homeStyles.dialogBox}
      >
        <View style={[homeStyles.dialogTitleContainer, props.style]}>
          <Text style={[homeStyles.dialogTitleText, styles.dialogTitleText]}>{props.dialogTitle}</Text>
        </View>

        <ScrollView
          ref={scrollView}
          onContentSizeChange={() => scrollView.current.scrollToEnd({animated: true})}
        >
          <View style={[styles.dialogContent, props.dialogContent]}>
            {props.children}
          </View>
        </ScrollView>
      </Overlay>
    </React.Fragment>
  );
};

export default StatusDialogBox;
