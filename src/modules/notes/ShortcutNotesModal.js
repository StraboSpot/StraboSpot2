import React from 'react';

import Modal from '../../shared/ui/modal/Modal';
import Notes from './Notes';

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
