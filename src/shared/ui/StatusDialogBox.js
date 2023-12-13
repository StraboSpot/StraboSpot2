import React, {useRef} from 'react';
import {ScrollView, Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import overlayStyles from '../../modules/home/overlay.styles';

const StatusDialogBox = ({
                           children,
                           closeModal,
                           closeTitle,
                           confirmText,
                           confirmTitleStyle,
                           onConfirmPress,
                           onTouchOutside,
                           overlayTitleText,
                           showCancelButton,
                           showConfirmButton,
                           title,
                           titleContainer,
                           isVisible,
                         }) => {
  const scrollView = useRef();

  return (
    <Overlay
      animationType={'fade'}
      isVisible={isVisible}
      onBackdropPress={onTouchOutside}
      overlayStyle={overlayStyles.overlayContainer}
    >
      <View style={[overlayStyles.titleContainer, titleContainer]}>
        <Text style={[overlayStyles.titleText, overlayTitleText]}>{title}</Text>
      </View>
      <ScrollView
        ref={scrollView}
        onContentSizeChange={() => scrollView.current.scrollToEnd({animated: true})}
      >
        <View style={overlayStyles.overlayContent}>
          {children}
        </View>
      </ScrollView>
      <View style={overlayStyles.buttonContainer}>
        {(showCancelButton || false) && (
          <Button
            title={closeTitle || 'Close'}
            type={'clear'}
            onPress={closeModal}
          />
        )}
        {showConfirmButton && (
          <Button
            title={confirmText || 'Ok'}
            titleStyle={confirmTitleStyle}
            type={'clear'}
            onPress={onConfirmPress}
          />
        )}
      </View>
    </Overlay>
  );
};

export default StatusDialogBox;
