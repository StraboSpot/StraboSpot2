import React from 'react';
import {Platform} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import {TagsModal} from './index';

const AddTagsToSpotsShortcutModal = (props) => {

  const renderAddTagsToSpotsShortcutModal = () => {
    return (
      <Modal style={{width: 285}}>
        <TagsModal close={props.close}/>
      </Modal>
    );
  };

  if (Platform.OS === 'android') return renderAddTagsToSpotsShortcutModal();
  else return <DragAnimation>{renderAddTagsToSpotsShortcutModal()}</DragAnimation>;
};

export default AddTagsToSpotsShortcutModal;
