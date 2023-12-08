import React from 'react';

import Notes from './Notes';
import Modal from '../../shared/ui/modal/Modal';

const ShortcutNotesModal = (props) => {

  const renderNotesShortcutModal = () => {
    return (
      <Modal onPress={props.onPress}>
        <Notes goToCurrentLocation={props.goToCurrentLocation}/>
      </Modal>
    );
  };

  return renderNotesShortcutModal();
};

export default ShortcutNotesModal;
