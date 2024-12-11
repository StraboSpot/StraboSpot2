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
        <Text style={{textAlign: 'center', padding: 10}}>This is the ORCID login section</Text>
      </View>

      <Input
        label={'Email or ORCID ID'}
        leftIcon={{ type: 'font-awesome', name: 'user' }}
        placeholder={'Email or 16-digit ORCID ID'}
      />
      <Input
        label={'Password'}
        leftIcon={{ type: 'font-awesome', name: 'lock' }}
        placeholder={'ORCID password'}
        secureTextEntry
      />
      <View style={overlayStyles.buttonContainer}>
        <Button
          onPress={onModalLogin}
          title={'Login'}
        />
        <Button
          onPress={onModalCancel}
          title={'Cancel'}
        />
      </View>
    </Overlay>
  );
};

export default IGNSModal;
