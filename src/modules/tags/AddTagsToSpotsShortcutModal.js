import React from 'react';

import {TagsModal} from './index';
import Modal from '../../shared/ui/modal/Modal';

const AddTagsToSpotsShortcutModal = ({goToCurrentLocation}) => {

  const renderAddTagsToSpotsShortcutModal = () => {
    return (
      <Modal>
        <TagsModal goToCurrentLocation={goToCurrentLocation}/>
      </Modal>
    );
  };

  return renderAddTagsToSpotsShortcutModal();
};

export default AddTagsToSpotsShortcutModal;
