import React, {useState} from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import AddButton from '../../shared/ui/AddButton';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Modals} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {NotebookPages} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {projectReducers} from '../project/project.constants';
import {TagDetailModal, TagsAtSpotList, useTagsHook} from '../tags';

const TagsNotebook = (props) => {
  console.log('PROPS in TAGS NOTEBOOK', props);
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();
  const [isDetailModalVisibile, setIsDetailModalVisible] = useState(false);

  const addTag = async () => {
    await useTags.addTag();
    setIsDetailModalVisible(true);
  };

  const closeTagDetailModal = () => {
    setIsDetailModalVisible(false);
    dispatch({type: projectReducers.ADD_TAG_TO_SELECTED_SPOT, addTagToSelectedSpot: false});
  };

  return (
    <React.Fragment>
      <ReturnToOverviewButton
        onPress={() => {
          dispatch(setNotebookPageVisible(NotebookPages.OVERVIEW));
          dispatch(setModalVisible({modal: null}));
        }}
      />
      <AddButton
        title={'Create New Tag'}
        onPress={addTag}
      />
      <View style={{flex: 1}}>
        <View style={commonStyles.dividerWithButton}>
          <SectionDivider dividerText={'Tags'}/>
          <Button
            title={'Assign/Remove'}
            type={'clear'}
            titleStyle={commonStyles.standardButtonText}
            onPress={() => dispatch(setModalVisible({modal: Modals.NOTEBOOK_MODALS.TAGS}))}
          />
        </View>
        <TagsAtSpotList openMainMenu={props.openMainMenu}/>
      </View>
      <TagDetailModal
        isVisible={isDetailModalVisibile}
        closeModal={closeTagDetailModal}
      />
    </React.Fragment>
  );
};

export default TagsNotebook;
