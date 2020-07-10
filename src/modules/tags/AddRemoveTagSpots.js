import React from 'react';
import {FlatList, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {projectReducers} from '../project/project.constants';

const AddRemoveTagSpots = () => {
  const dispatch = useDispatch();
  const selectedTag = useSelector((state) => state.project.selectedTag);
  const spots = useSelector((state) => state.spot.spots);
  const tags = useSelector(state => state.project.project.tags || []);

  const addRemoveSpotFromTag = (spotId) => {
    let selectedTagCopy = JSON.parse(JSON.stringify(selectedTag));
    if (selectedTagCopy.spots) {
      if (selectedTagCopy.spots.includes(spotId)) {
        selectedTagCopy.spots = selectedTagCopy.spots.filter(id => spotId !== id);
      }
      else selectedTagCopy.spots.push(spotId);
    }
    else {
      selectedTagCopy.spots = [];
      selectedTagCopy.spots.push(spotId);
    }
    const updatedTags = tags.filter(tag => tag.id !== selectedTagCopy.id);
    updatedTags.push(selectedTagCopy);
    dispatch({type: projectReducers.UPDATE_PROJECT, field: 'tags', value: updatedTags});
  };

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
      onPress={() => addRemoveSpotFromTag(spot.properties.id)}
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
