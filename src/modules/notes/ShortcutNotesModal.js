import React from 'react';
import {Platform} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import Notes from './Notes';

const ShortcutNotesModal = () => {

  const renderNotesShortcutModal = () => {
    return (
      <Modal>
        <Notes/>
      </Modal>
    );
  };

  if (Platform.OS === 'android') return renderNotesShortcutModal();
  else return <DragAnimation>{renderNotesShortcutModal()}</DragAnimation>;
};

export default ShortcutNotesModal;
