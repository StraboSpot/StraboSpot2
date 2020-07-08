import React from 'react';
import {FlatList, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';

const AddRemoveTagSpots = (props) => {
  const dispatch = useDispatch();
  const selectedTag = useSelector((state) => state.project.selectedTag);
  const spots = useSelector((state) => state.spot.spots);
  const tags = useSelector(state => state.project.project.tags);

  const addRemoveSpotFromTag = (spotId) => {
    // console.log(spotId)
    const selectedTagCopy = [...selectedTag.spots];
    if (selectedTagCopy.includes(spotId)) {
      const newspotTagArr = selectedTagCopy.filter(id => {
        return spotId !== id;
      });
      console.table(newspotTagArr);
    }
    else {
      selectedTagCopy.push(spotId);
      console.table(selectedTagCopy);
    }
    const tag = tags.map(tag => tag === selectedTag.id)
    console.log('TAG', tag)
    if (tag) {

    }
  };

  const showSpotTags = (spot) => {
    const spotsWithTags = selectedTag.spots.find(tag => {
      return spot.properties.id === tag;
    });
    console.table(spotsWithTags);
    return spotsWithTags;
  };

  const renderSpotsList = (spot) => {
    return <ListItem
      title={spot.properties.name}
      onPress={() => addRemoveSpotFromTag(spot.properties.id)}
      checkmark={spot.properties.id === showSpotTags(spot)}
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
          renderItem={({item}) => renderSpotsList(item)}
        />
      </View>
    </React.Fragment>
  );
};

export default AddRemoveTagSpots;
