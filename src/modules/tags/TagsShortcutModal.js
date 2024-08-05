import React from 'react';

import {TagsModal} from './index';
import Modal from '../../shared/ui/modal/Modal';

const TagsShortcutModal = ({
                             onPress,
                             zoomToCurrentLocation,
                           }) => {

  const renderTagsShortcutModal = () => {
    return (
      <Modal onPress={onPress}>
        <TagsModal zoomToCurrentLocation={zoomToCurrentLocation}/>
      </Modal>
    );
  };

  return renderTagsShortcutModal();
};

export default TagsShortcutModal;
