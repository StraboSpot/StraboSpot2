import React, {useState} from 'react';
import {FlatList} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {MODAL_KEYS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {PAGE_KEYS,PRIMARY_PAGES} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, TagsAtSpotList} from '../tags';
import FeatureTagsAtSpotList from './FeatureTagsAtSpotList';

const TagsNotebook = (props) => {
  console.log('PROPS in TAGS NOTEBOOK', props);
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
            <TagsAtSpotList page={props.page} openMainMenu={props.openMainMenu}/>
          </React.Fragment>
        }
        ListFooterComponent={pageVisible !== PAGE_KEYS.GEOLOGIC_UNITS && (
          <React.Fragment>
            <SectionDivider dividerText={'Feature Tags'}/>
            <FeatureTagsAtSpotList page={props.page} openMainMenu={props.openMainMenu}/>
          </React.Fragment>
        )}
      />
      <TagDetailModal
        isVisible={isDetailModalVisibile}
        closeModal={closeTagDetailModal}
      />
    </React.Fragment>
  );
};

export default TagsNotebook;
