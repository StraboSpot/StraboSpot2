import React from 'react';
import {View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {SIDE_PANEL_VIEWS} from '../main-menu-panel/mainMenu.constants';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {SpotsList} from '../spots';
import {useTagsHook} from '../tags';

const AddRemoveTagSpots = () => {
  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);

  const [useTags] = useTagsHook();

  const handleSpotChecked = (spot) => {
    useTags.addRemoveSpotFromTag(spot.properties.id, selectedTag);
  };

  return (
    <React.Fragment>
      <SidePanelHeader
        backButton={() => dispatch(setSidePanelVisible({bool: true, view: SIDE_PANEL_VIEWS.TAG_DETAIL}))}
        title={`${selectedTag.name}`}
        headerTitle={!isEmpty(selectedTag) && `Add/Remove ${selectedTag.name}`}
      />
      <View style={{...commonStyles.buttonContainer, flex: 1}}>
        <SpotsList
          onPress={handleSpotChecked}
          isCheckedList={true}
        />
      </View>
    </React.Fragment>
  );
};

export default AddRemoveTagSpots;
