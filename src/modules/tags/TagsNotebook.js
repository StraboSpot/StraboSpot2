import React, {useState} from 'react';
import {FlatList} from 'react-native';

import {useDispatch} from 'react-redux';

import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {MODAL_KEYS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, TagsAtSpotList} from '../tags';
import FeatureTagsAtSpotList from './FeatureTagsAtSpotList';

const TagsNotebook = (props) => {
  console.log('PROPS in TAGS NOTEBOOK', props);
  const dispatch = useDispatch();
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
              dividerText={'Spot Tags'}
              buttonTitle={'Assign/Remove'}
              onPress={() => dispatch(setModalVisible({modal: MODAL_KEYS.NOTEBOOK.TAGS}))}
            />
            <TagsAtSpotList openMainMenu={props.openMainMenu}/>
            <SectionDivider
              dividerText={'Feature Tags'}
            />
            <FeatureTagsAtSpotList openMainMenu={props.openMainMenu}/>
          </React.Fragment>
        }
      />
      <TagDetailModal
        isVisible={isDetailModalVisibile}
        closeModal={closeTagDetailModal}
      />
    </React.Fragment>
  );
};

export default TagsNotebook;
