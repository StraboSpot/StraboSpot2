import React, {useState} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import ColorPickerModal from '../../shared/ColorPickerModal';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {mainMenuPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {setSelectedSpot} from '../spots/spots.slice';
import {TagDetail, TagDetailModal} from '../tags';

const TagDetailSidePanel = (props) => {

  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const [isDetailModalVisibile, setIsDetailModalVisible] = useState(false);
  const [isColorPickerModalVisibile, setIsColorPickerModalVisible] = useState(false);

  return (
    <React.Fragment>
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 1}}>
          <SidePanelHeader
            backButton={() => dispatch(setSidePanelVisible({bool: false}))}
            title={'Tags'}
            headerTitle={!isEmpty(selectedTag) && selectedTag.name}
          />
        </View>
        <View style={{
          width: 50,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
        }}>
          <TouchableOpacity
            style={{
              width: 30, height: 30, borderWidth: 1, borderColor: themes.PRIMARY_BACKGROUND_COLOR,
              backgroundColor: selectedTag.color,
            }}
            onPress={() => setIsColorPickerModalVisible(true)}>
            {!selectedTag.color && <Text>No Color</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={{flex: 1}}>
        <TagDetail
          openSpot={(spot) => {
            dispatch(setSelectedSpot(spot));
            props.openNotebookPanel();
          }}
          addRemoveSpots={() => {
            dispatch(setSidePanelVisible(
              {bool: true, view: mainMenuPanelReducers.SET_SIDE_PANEL_VIEW.TAG_ADD_REMOVE_SPOTS},
            ));
          }}
          setIsDetailModalVisible={() => setIsDetailModalVisible(true)}
        />
      </View>
      <TagDetailModal
        isVisible={isDetailModalVisibile}
        closeModal={() => setIsDetailModalVisible(false)}
      />
      <ColorPickerModal
        isVisible={isColorPickerModalVisibile}
        closeModal={() => setIsColorPickerModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default TagDetailSidePanel;
