import React from 'react';
import {FlatList, View} from 'react-native';

import {Avatar, Icon, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {BLUE} from '../../shared/styles.constants';
import {settingPanelReducers} from '../main-menu-panel/mainMenuPanel.constants';
import SidePanelHeader from '../main-menu-panel/sidePanel/SidePanelHeader';
import {useSpotsHook} from '../spots';
import {useTagsHook} from '../tags';

const AddRemoveTagSpots = () => {
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();
  const dispatch = useDispatch();
  const selectedTag = useSelector((state) => state.project.selectedTag);
  const spots = useSelector((state) => state.spot.spots);

  const renderSpotListItem = (spot) => {
    return <ListItem onPress={() => useTags.addRemoveSpotFromTag(spot.properties.id)} bottomDivider>
      <Avatar source={useSpots.getSpotGemometryIconSource(spot)} size={20}/>
      <ListItem.Content>
        <ListItem.Title>{spot.properties.name}</ListItem.Title>
      </ListItem.Content>
      {selectedTag.spots && selectedTag.spots.includes(spot.properties.id)
      && <Icon name={'checkmark-outline'} type={'ionicon'} size={20} color={BLUE}/>}
    </ListItem>;
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
