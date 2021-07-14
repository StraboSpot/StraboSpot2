import React from 'react';
import {Platform} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import {TagsModal} from './index';

const TagsShortcutModal = (props) => {

  const renderTagsShortcutModal = () => {
    return (
      <Modal
        style={{width: 285}}
        onPress={props.onPress}
      >
        <TagsModal goToCurrentLocation={props.goToCurrentLocation}/>
      </Modal>
    );
  };

  if (Platform.OS === 'android') return renderTagsShortcutModal();
  else return <DragAnimation>{renderTagsShortcutModal()}</DragAnimation>;
};

export default TagsShortcutModal;
