import React from 'react';

import {TagsModal} from './index';
import Modal from '../../shared/ui/modal/Modal';

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
