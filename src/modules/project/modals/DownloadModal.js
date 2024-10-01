import React from 'react';
import {Text, View} from 'react-native';

import {Button} from 'react-native-elements';

import overlayStyles from '../../home/overlays/overlay.styles';
import MenuModal from '../MenuModal';

const DownloadModal = ({visible, closeModal, project}) => {
  return (
    <MenuModal
      modalTitle={'Downloading Project'}
      visible={visible}
    >
      <View>
        <Text>{project}</Text>
      </View>
      <Button
        containerStyle={overlayStyles.button}
        title={'Close'}
        onPress={closeModal}
        type={'clear'}
      />
    </MenuModal>
  );
};

export default DownloadModal;
