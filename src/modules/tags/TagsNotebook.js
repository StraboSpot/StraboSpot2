import React, {useState} from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import FeatureTagsAtSpotList from './FeatureTagsAtSpotList';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {setModalVisible} from '../home/home.slice';
import {PAGE_KEYS} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, TagsAtSpotList} from '../tags';

const TagsNotebook = ({openMainMenuPanel, page}) => {
  const dispatch = useDispatch();
  const pagesStack = useSelector(state => state.notebook.visibleNotebookPagesStack);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const pageVisible = pagesStack.slice(-1)[0];

  const closeTagDetailModal = () => {
    setIsDetailModalVisible(false);
    dispatch(addedTagToSelectedSpot(false));
  };

  return (
    <>
      <ReturnToOverviewButton/>
      <FlatList
        ListHeaderComponent={
          <>
            <SectionDividerWithRightButton
              dividerText={pageVisible !== PAGE_KEYS.GEOLOGIC_UNITS ? 'Spot Tags' : 'Geologic Units'}
              buttonTitle={'Assign/Remove'}
              onPress={() => dispatch(setModalVisible({modal: pageVisible}))}
            />
            <TagsAtSpotList openMainMenuPanel={openMainMenuPanel} page={page}/>
          </>
        }
        ListFooterComponent={pageVisible !== PAGE_KEYS.GEOLOGIC_UNITS && (
          <>
            <SectionDivider dividerText={'Feature Tags'}/>
            <FeatureTagsAtSpotList openMainMenuPanel={openMainMenuPanel} page={page}/>
          </>
        )}
      />
      {isDetailModalVisible && <TagDetailModal closeModal={closeTagDetailModal}/>}
    </>
  );
};

export default TagsNotebook;
