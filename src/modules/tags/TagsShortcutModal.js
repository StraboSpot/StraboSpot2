import React from 'react';

import {TagsModal} from './index';
import Modal from '../../shared/ui/modal/Modal';

const TagsShortcutModal = (props) => {

  const renderTagsShortcutModal = () => {
    return (
      <Modal onPress={props.onPress}>
        <TagsModal goToCurrentLocation={props.goToCurrentLocation}/>
      </Modal>
    );
  };

  return renderTagsShortcutModal();
};

export default TagsShortcutModal;
