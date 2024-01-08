import React, {useState} from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import FeatureTagsAtSpotList from './FeatureTagsAtSpotList';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {setModalVisible} from '../home/home.slice';
import {MODAL_KEYS, PAGE_KEYS} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, TagsAtSpotList} from '../tags';

const TagsNotebook = ({openMainMenu, page}) => {
  const dispatch = useDispatch();
  const pageVisible = useSelector(state => state.notebook.visibleNotebookPagesStack.slice(-1)[0]);

  const [isDetailModalVisibile, setIsDetailModalVisible] = useState(false);

  const closeTagDetailModal = () => {
    setIsDetailModalVisible(false);
    dispatch(addedTagToSelectedSpot(false));
  };

  return (
    <React.Fragment>
      <ReturnToOverviewButton/>
      <FlatList
        ListHeaderComponent={
          <React.Fragment>
            <SectionDividerWithRightButton
              dividerText={pageVisible !== PAGE_KEYS.GEOLOGIC_UNITS ? 'Spot Tags' : 'Geologic Units'}
              buttonTitle={'Assign/Remove'}
              onPress={() => dispatch(setModalVisible({modal: MODAL_KEYS.NOTEBOOK.TAGS}))}
            />
            <TagsAtSpotList page={page} openMainMenu={openMainMenu}/>
          </React.Fragment>
        }
        ListFooterComponent={pageVisible !== PAGE_KEYS.GEOLOGIC_UNITS && (
          <React.Fragment>
            <SectionDivider dividerText={'Feature Tags'}/>
            <FeatureTagsAtSpotList page={page} openMainMenu={openMainMenu}/>
          </React.Fragment>
        )}
      />
      <TagDetailModal
        isVisible={isDetailModalVisibile}
        closeModal={closeTagDetailModal}
        type={page?.key === PAGE_KEYS.GEOLOGIC_UNITS && PAGE_KEYS.GEOLOGIC_UNITS}
      />
    </React.Fragment>
  );
};

export default TagsNotebook;
