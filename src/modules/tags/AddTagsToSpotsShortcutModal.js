import React from 'react';

import Modal from '../../shared/ui/modal/Modal';
import {TagsModal} from './index';

const AddTagsToSpotsShortcutModal = (props) => {

  const renderAddTagsToSpotsShortcutModal = () => {
    return (
      <Modal>
        <TagsModal close={props.close} goToCurrentLocation={props.goToCurrentLocation}/>
      </Modal>
    );
  };

  return renderAddTagsToSpotsShortcutModal();
};

export default AddTagsToSpotsShortcutModal;
