import React, {useState} from 'react';
import {View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import AddButton from '../../shared/ui/AddButton';
import Modal from '../../shared/ui/modal/Modal';
import modalStyle from '../../shared/ui/modal/modal.style';
import {MODAL_KEYS, PAGE_KEYS} from '../page/page.constants';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, TagsModal, useTags} from '../tags';

const TagsNotebookModal = ({
                             closeModal,
                             isFeatureLevelTagging,
                             onPress,
                           }) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const pagesStack = useSelector(state => state.notebook.visibleNotebookPagesStack);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const {addTag} = useTags();

  const pageVisible = pagesStack.slice(-1)[0];

  const onAddTag = async () => {
    addTag();
    setIsDetailModalVisible(true);
  };

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
        <View style={[modalStyle.textContainer]}>
          <AddButton
            title={'Create New Tag'}
            onPress={onAddTag}
            type={'outline'}
          />
        </View>
        <TagsModal isFeatureLevelTagging={isFeatureLevelTagging}/>
        <TagDetailModal
          isVisible={isDetailModalVisible}
          closeModal={closeTagDetailModal}
          type={pageVisible === PAGE_KEYS.GEOLOGIC_UNITS && PAGE_KEYS.GEOLOGIC_UNITS}
        />
      </Modal>
    );
  };
  if ((modalVisible === MODAL_KEYS.NOTEBOOK.TAGS || modalVisible === MODAL_KEYS.OTHER.FEATURE_TAGS)
    && !isEmpty(selectedSpot)) {
    return renderTagsModalContent();
  }
  else return null;
};

export default TagsNotebookModal;
