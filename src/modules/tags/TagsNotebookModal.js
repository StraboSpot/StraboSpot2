import React from 'react';

import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import Modal from '../../shared/ui/modal/Modal';
import {TagsModal} from '../tags';

const TagsNotebookModal = ({
                             closeModal,
                             isFeatureLevelTagging,
                             onPress,
                           }) => {
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const renderTagsModalContent = () => {
    return (
      <Modal onPress={onPress} closeModal={closeModal}>
        <TagsModal isFeatureLevelTagging={isFeatureLevelTagging}/>
      </Modal>
    );
  };

  if (!isEmpty(selectedSpot)) return renderTagsModalContent();
  else return null;
};

export default TagsNotebookModal;
