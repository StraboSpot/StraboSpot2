import React from 'react';
import {Linking, Text, View, StyleSheet} from 'react-native';

import {Button, Overlay} from 'react-native-elements';

import overlayStyles from './overlays/overlay.styles';
import {LARGE_TEXT_SIZE, MEDIUM_TEXT_SIZE, SMALL_SCREEN, TEXT_WEIGHT} from '../../shared/styles.constants';


const WhatsNewModal = ({currentVersion, isWhatsNewModalVisible, closeModal}) => {
  return (
    <Overlay
      animationType={'slide'}
      isVisible={isWhatsNewModalVisible}
      overlayStyle={SMALL_SCREEN ? overlayStyles.overlayContainerFullScreen : overlayStyles.overlayContainer}
      backdropStyle={overlayStyles.backdropStyles}
      fullScreen={SMALL_SCREEN}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{`Whats new in version ${currentVersion}`}</Text>
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>- Bug fixes</Text>
          <Text style={styles.contentText}>- Added optional warning for duplicate sample name</Text>
          <Text style={styles.contentText}>- Added optional warning for duplicate Spot name </Text>
          <Text style={styles.contentText}>- Added Tephra & Earthquakes to Notebook Overview page </Text>
        </View>

        <Button
          onPress={closeModal}
          title={'Got it'}
          type={'clear'}
        />
      </View>
    </Overlay>
  );
};

export default WhatsNewModal;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
    // flex: 1,
    // justifyContent: 'center',
  },
  contentContainer: {
    marginTop: 10,
  },
  contentText: {
    // alignSelf: 'center',
    // fontSize: MEDIUM_TEXT_SIZE,
    // fontWeight:'600',
    // padding: 20,
  },
  title: {
    alignSelf: 'center',
    fontSize: LARGE_TEXT_SIZE,
    fontWeight: TEXT_WEIGHT,
  },
});
