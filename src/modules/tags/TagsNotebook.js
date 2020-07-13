import React, {useState} from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import AddButton from '../../shared/ui/AddButton';
import SectionDivider from '../../shared/ui/SectionDivider';
import {homeReducers} from '../home/home.constants';
import {NotebookPages, notebookReducers} from '../notebook-panel/notebook.constants';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {projectReducers} from '../project/project.constants';
import {TagDetailModal, TagsAtSpotList} from '../tags';

const TagsNotebook = () => {

  const dispatch = useDispatch();
  const [isDetailModalVisibile, setIsDetailModalVisible] = useState(false);

  const addTag = () => {
    dispatch({type: projectReducers.SET_SELECTED_TAG, tag: {}});
    setIsDetailModalVisible(true);
  };

  return (
    <React.Fragment>
      <ReturnToOverviewButton
        onPress={() => {
          dispatch({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: NotebookPages.OVERVIEW});
          dispatch({type: homeReducers.SET_MODAL_VISIBLE, modal: null});
        }}
      />
      <AddButton
        title={'Add Tag'}
        onPress={addTag}
      />
      <View style={{flex: 1}}>
        <View style={commonStyles.dividerWithButton}>
          <SectionDivider dividerText={'Tags'}/>
          <Button
            title={'Add/remove'}
            type={'clear'}
            titleStyle={commonStyles.standardButtonText}
          />
        </View>
        <TagsAtSpotList/>
      </View>
      <TagDetailModal
        isVisible={isDetailModalVisibile}
        closeModal={() => setIsDetailModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default TagsNotebook;
