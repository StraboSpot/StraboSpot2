import React, {useState} from 'react';
import {Text, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import {messages} from './Messages';
import {SMALL_SCREEN} from '../../../shared/styles.constants';
import overlayStyles from '../../home/overlays/overlay.styles';

const DeleteOverlay = ({closeModal, deleteSample, isVisible}) => {

  return (
    <Overlay
      isVisible={isVisible}
      overlayStyle={SMALL_SCREEN ? overlayStyles.overlayContainerFullScreen : {...overlayStyles.overlayContainer, height: '30%'}}
      onBackdropPress={closeModal}
    >
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'yellow'}}>
        <Text style={overlayStyles.titleText}>WARNING!</Text>
      </View>
      <View style={{flex: 4, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={overlayStyles.headerText}>IGSN ASSIGNED</Text>
        <Text style={{...overlayStyles.statusMessageText, fontSize: 16, fontWeight: '500'}}>{messages.deleteMessage}
        </Text>
      </View>
      <View style={overlayStyles.buttonContainer}>
        <Button
          title={'Cancel'}
          onPress={closeModal}
        />
        <Button
          title={'Delete'}
          titleStyle={{color: 'white', fontWeight: '700'}}
          buttonStyle={{backgroundColor: 'red'}}
          onPress={deleteSample}
        />
      </View>
    </Overlay>
  );
};

export default DeleteOverlay;
