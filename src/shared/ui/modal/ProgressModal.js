import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

// import ProgressBar from 'react-native-progress/Bar';
import overlayStyles from '../../../modules/home/overlays/overlay.styles';

const ProgressModal = ({
                         animation,
                         buttonText,
                         children,
                         dialogTitle,
                         disabled,
                         info,
                         isProgressModalVisible,
                         onPressComplete,
                         showButton,
                         showInfo,
                       }) => {
  return (
    <Overlay
      isVisible={isProgressModalVisible}
      animationType={'fade'}
      overlayStyle={overlayStyles.overlayContainer}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>{dialogTitle}</Text>
      </View>
      <View>
        {children}
      </View>
      <View style={overlayStyles.animationContainer}>
        {animation}
      </View>

      {showInfo && (
        <View style={{flex: 1}}>
          {info}
        </View>
      )}
      {showButton && (
        <Button
          disabled={disabled}
          onPress={onPressComplete}
          type={'clear'}
          title={buttonText || 'OK'}
          titleStyle={overlayStyles.buttonText}
        />
      )}
    </Overlay>
  );
};

export default ProgressModal;
