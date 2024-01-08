import React from 'react';

import {TagsModal} from './index';
import Modal from '../../shared/ui/modal/Modal';

const TagsShortcutModal = ({
                             goToCurrentLocation,
                             onPress,
                           }) => {

  const renderTagsShortcutModal = () => {
    return (
      <Modal onPress={onPress}>
        <TagsModal goToCurrentLocation={goToCurrentLocation}/>
      </Modal>
    );
  };

  return renderTagsShortcutModal();
};

export default TagsShortcutModal;
