import React, {useState} from 'react';
import {Platform, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import AddButton from '../../shared/ui/AddButton';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import modalStyle from '../../shared/ui/modal/modal.style';
import uiStyles from '../../shared/ui/ui.styles';
import {MODALS} from '../home/home.constants';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, TagsModal, useTagsHook} from '../tags';

const TagsNotebookModal = (props) => {
  const dispatch = useDispatch();
  const [useTags] = useTagsHook();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const addTag = async () => {
    await useTags.addTag();
    setIsDetailModalVisible(true);
  };

  const closeTagDetailModal = () => {
    setIsDetailModalVisible(false);
    dispatch(addedTagToSelectedSpot(false));
  };

  const renderTagsModalContent = () => {
    return (
      <React.Fragment>
        <Modal
          style={{...uiStyles.modalPosition, width: 285}}
          close={props.close}
          textStyle={{fontWeight: 'bold'}}
          onPress={props.onPress}
        >
          <View style={[modalStyle.textContainer]}>
            <AddButton
              title={'Add New Tag'}
              onPress={() => addTag()}
              type={'outline'}
            />
          </View>
          <TagsModal/>
        </Modal>
        <TagDetailModal
          isVisible={isDetailModalVisible}
          closeModal={closeTagDetailModal}
        />
      </React.Fragment>
    );
  };

  if (modalVisible === MODALS.NOTEBOOK_MODALS.TAGS && !isEmpty(selectedSpot)) {
    if (Platform.OS === 'android') return renderTagsModalContent();
    else return <DragAnimation>{renderTagsModalContent()}</DragAnimation>;
  }
};

export default TagsNotebookModal;
