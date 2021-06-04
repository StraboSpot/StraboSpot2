import React, {useState} from 'react';
import {View} from 'react-native';

import {useDispatch} from 'react-redux';

import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, TagsAtSpotList} from '../tags';

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
      <View style={{flex: 1}}>
        <SectionDividerWithRightButton
          dividerText={'Tags'}
          buttonTitle={'Assign/Remove'}
          onPress={() => dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.TAGS}))}
        />
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
