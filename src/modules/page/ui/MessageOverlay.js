import React from 'react';
import {Text, View} from 'react-native';
import {Button, Overlay} from 'react-native-elements';
import {SMALL_SCREEN} from '../../../shared/styles.constants';
import overlayStyles from '../../home/overlays/overlay.styles';
import {messages} from './Messages';

const MessageOverlay = ({
                          isVisible,
                          closeModal,
                        }) => {
  return (
    <Overlay
      isVisible={isVisible}
      overlayStyle={SMALL_SCREEN ? overlayStyles.overlayContainerFullScreen : {
        ...overlayStyles.overlayContainer,
        height: 300,
      }}
      onBackdropPress={closeModal}
    >
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'yellow'}}>
        <Text style={overlayStyles.titleText}>WARNING!</Text>
      </View>
      <View style={{flex: 4, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={overlayStyles.headerText}>Updating Sample</Text>
        <Text style={{...overlayStyles.statusMessageText, fontSize: 16, fontWeight: '500'}}>{messages.updateMessage}
        </Text>
      </View>
      <View style={overlayStyles.buttonContainer}>
        <Button
          title={'OK'}
          onPress={closeModal}
        />
      </View>
    </Overlay>
  );
};

export default MessageOverlay;
