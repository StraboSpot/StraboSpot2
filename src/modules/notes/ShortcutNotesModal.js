import React from 'react';

import Notes from './Notes';
import Modal from '../../shared/ui/modal/Modal';

const ShortcutNotesModal = ({onPress, zoomToCurrentLocation}) => {

  const renderNotesShortcutModal = () => {
    return (
      <Modal onPress={onPress}>
        <Notes zoomToCurrentLocation={zoomToCurrentLocation}/>
      </Modal>
    );
  };

  return renderNotesShortcutModal();
};

export default ShortcutNotesModal;
