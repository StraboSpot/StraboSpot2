import React from 'react';

import Notes from './Notes';
import Modal from '../../shared/ui/modal/Modal';

const ShortcutNotesModal = ({goToCurrentLocation, onPress}) => {

  const renderNotesShortcutModal = () => {
    return (
      <Modal onPress={onPress}>
        <Notes goToCurrentLocation={goToCurrentLocation}/>
      </Modal>
    );
  };

  return renderNotesShortcutModal();
};

export default ShortcutNotesModal;
