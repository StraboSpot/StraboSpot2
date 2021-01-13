import React, {useState} from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import AddButton from '../../shared/ui/AddButton';
import SectionDivider from '../../shared/ui/SectionDivider';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {addedTagToSelectedSpot} from '../project/projects.slice';
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
    dispatch(addedTagToSelectedSpot(false));
  };

  return (
    <React.Fragment>
      <ReturnToOverviewButton
        onPress={() => {
          dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW));
          dispatch(setModalVisible({modal: null}));
        }}
      />
      <AddButton
        title={'Add New Tag'}
        onPress={addTag}
        type={'outline'}
      />
      <View style={{flex: 1}}>
        <View style={commonStyles.dividerWithButton}>
          <SectionDivider dividerText={'Tags'}/>
          <Button
            title={'Assign/Remove'}
            type={'clear'}
            titleStyle={commonStyles.standardButtonText}
            onPress={() => dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.TAGS}))}
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
