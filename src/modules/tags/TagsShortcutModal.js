import React from 'react';

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

  return renderTagsShortcutModal();
};

export default TagsShortcutModal;
