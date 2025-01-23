import React from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay, Input, Icon, Avatar} from 'react-native-elements';

import overlayStyles from '../home/overlays/overlay.styles';

const IGNSModal = (
  {onModalCancel,
  onModalLogin,
  showIGSNModal,}
) => {
  return (
    <Overlay
      isVisible={showIGSNModal}
      overlayStyle={overlayStyles.overlayContainer}
    >
      <View style={overlayStyles.overlayContent}>
        <Avatar
          source={require('../../assets/images/logos/orcid_logo_icon.jpg')}
          // style={{height: 60, width: 70}}
          size={'large'}
        />
        <Text style={{textAlign: 'center', padding: 10}}>This is the the data that will be uploaded to SESAR:</Text>
      </View>
        <Button
          onPress={onModalCancel}
          title={'Cancel'}
        />
    </Overlay>
  );
};

export default IGNSModal;
