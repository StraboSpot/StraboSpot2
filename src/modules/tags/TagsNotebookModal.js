import React, {useState} from 'react';
import {Platform, Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import AddButton from '../../shared/ui/AddButton';
import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import {MODALS} from '../home/home.constants';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, TagsModal, useTagsHook} from '../tags';

const TagsNotebookModal = (props) => {
  const dispatch = useDispatch();
  const [useTags] = useTagsHook();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const project = useSelector(state => state.project.project);
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

  if (modalVisible === MODALS.NOTEBOOK_MODALS.TAGS && !isEmpty(selectedSpot)) {
    if (Platform.OS === 'android') {
      return (
        <View style={uiStyles.modalPosition}>
          <Modal
            style={{width: 285}}
            close={props.close}
            cancel={props.cancel}
            buttonTitleLeft={'Cancel'}
            textStyle={{fontWeight: 'bold'}}
            onPress={props.onPress}
          >
            {project.tags && !isEmpty(project.tags) ? <TagsModal/>
              : <View style={{paddingTop: 10, paddingBottom: 10}}>
                <Text style={commonStyles.noValueText}>No tags in project.</Text>
                <Text style={commonStyles.noValueText}>To add a tag press 'Add Tag.'</Text>
                <AddButton
                  title={'Create New Tag'}
                  onPress={() => addTag()}
                />
              </View>
            }
          </Modal>
          <TagDetailModal
            isVisible={isDetailModalVisible}
            closeModal={closeTagDetailModal}
          />
        </View>
      );
    }
    else {
      return (
        <DragAnimation style={uiStyles.modalPosition}>
          <Modal
            style={{width: 285}}
            close={props.close}
            cancel={props.cancel}
            buttonTitleLeft={'Cancel'}
            textStyle={{fontWeight: 'bold'}}
            onPress={props.onPress}
          >
            <View style={{paddingTop: 10, paddingBottom: 10}}>
              {project.tags && isEmpty(project.tags)
              && <Text style={commonStyles.noValueText}>No tags in project.</Text>}
              <AddButton
                title={'Create New Tag'}
                onPress={() => addTag()}
              />
            </View>
            <TagsModal/>
          </Modal>
          <TagDetailModal
            isVisible={isDetailModalVisible}
            closeModal={closeTagDetailModal}
          />
        </DragAnimation>
      );
    }
  }
};

export default TagsNotebookModal;
