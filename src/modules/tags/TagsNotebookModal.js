import React, {useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import Modal from '../../shared/ui/modal/Modal';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, TagsModal} from '../tags';

const TagsNotebookModal = ({
                             closeModal,
                             isFeatureLevelTagging,
                             onPress,
                           }) => {
  const dispatch = useDispatch();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const closeTagDetailModal = () => {
    setIsDetailModalVisible(false);
    dispatch(addedTagToSelectedSpot(false));
  };

  const renderTagsModalContent = () => {
    return (
      <Modal
        onPress={onPress}
        closeModal={closeModal}
      >
        <TagsModal isFeatureLevelTagging={isFeatureLevelTagging}/>
        {isDetailModalVisible && <TagDetailModal closeModal={closeTagDetailModal}/>}
      </Modal>
    );
  };

  if (!isEmpty(selectedSpot)) return renderTagsModalContent();
  else return null;
};

export default TagsNotebookModal;
