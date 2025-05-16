import React from 'react';
import {Text, View} from 'react-native';

import {Overlay} from '@rn-vui/base';

import overlayStyles from '../home/overlays/overlay.styles';


const MenuModal = ({
                     children,
                     modalTitle,
                     overlayStyle,
                     visible,
                   }) => {

  return (
    <Overlay
      supportedOrientations={['portrait', 'landscape']}
      animationType={'fade'}
      overlayStyle={[overlayStyles.overlayContainer, overlayStyle]}
      backdropStyle={overlayStyles.backdropStyles}
      isVisible={visible}
    >
      <View style={overlayStyles.titleContainer}>
        <Text style={overlayStyles.titleText}>{modalTitle}</Text>
      </View>
      <View style={overlayStyles.overlayContent}>
        {children}
      </View>
    </Overlay>
  );
};

export default MenuModal;
