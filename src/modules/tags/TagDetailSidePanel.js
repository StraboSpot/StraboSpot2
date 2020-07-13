import React, {useState} from 'react';
import {View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {TagDetail, TagDetailModal} from '../tags';

const TagDetailSidePanel = (props) => {
  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const [isDetailModalVisibile, setIsDetailModalVisible] = useState(false);

  return (
    <React.Fragment>
      <SidePanelHeader
        backButton={() => dispatch({type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE, bool: false})}
        title={'Tags'}
        headerTitle={!isEmpty(selectedTag) && selectedTag.name}
      />
      <View style={{flex: 1}}>
        <TagDetail
          openNotebookPanel={props.openNotebookPanel}
          setIsDetailModalVisible={() => setIsDetailModalVisible(true)}
        />
      </View>
      <TagDetailModal
        isVisible={isDetailModalVisibile}
        closeModal={() => setIsDetailModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default TagDetailSidePanel;
