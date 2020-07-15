import React from 'react';
import {FlatList, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {useTagsHook} from '../tags';

const AddRemoveTagSpots = () => {
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();
  const selectedTag = useSelector((state) => state.project.selectedTag);
  const spots = useSelector((state) => state.spot.spots);
  const tags = useSelector(state => state.project.project.tags || []);

  const showSpotTags = (spot) => {
    if (selectedTag.spots) {
      const spotsWithTags = selectedTag.spots.find(tag => spot.properties.id === tag);
      return spotsWithTags;
    }
  };

  const renderSpotListItem = (spot) => {
    const spotsWithTag = showSpotTags(spot);
    return <ListItem
      title={spot.properties.name}
      onPress={() => useTags.addRemoveSpotFromTag(spot.properties.id)}
      checkmark={spot.properties.id === spotsWithTag}
      bottomDivider
    />;
  };

  return (
    <React.Fragment>
      <SidePanelHeader
        backButton={() =>
          dispatch({
            type: settingPanelReducers.SET_SIDE_PANEL_VISIBLE,
            bool: true,
            view: settingPanelReducers.SET_SIDE_PANEL_VIEW.TAG_DETAIL,
          })
        }
        title={`${selectedTag.name}`}
        headerTitle={!isEmpty(selectedTag) && `Add/Remove ${selectedTag.name}`}
      />
      <View style={{...commonStyles.buttonContainer, flex: 1}}>
        <FlatList
          keyExtractor={(spot) => spot.properties.id.toString()}
          data={Object.values(spots)}
          renderItem={({item}) => renderSpotListItem(item)}
        />
      </View>
    </React.Fragment>
  );
};

export default AddRemoveTagSpots;
