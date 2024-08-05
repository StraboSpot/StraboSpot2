import React from 'react';

import {TagsModal} from './index';
import Modal from '../../shared/ui/modal/Modal';

const AddTagsToSpotsShortcutModal = ({zoomToCurrentLocation}) => {

  const renderAddTagsToSpotsShortcutModal = () => {
    return (
      <Modal>
        <TagsModal zoomToCurrentLocation={zoomToCurrentLocation}/>
      </Modal>
    );
  };

  return renderAddTagsToSpotsShortcutModal();
};

export default AddTagsToSpotsShortcutModal;
