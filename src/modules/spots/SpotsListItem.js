import React from 'react';
import {FlatList} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import useNestingHook from '../nesting/useNesting';
import {useTagsHook} from '../tags';
import useSpotsHook from './useSpots';

const SpotsListItem = (props) => {
  const [useNesting] = useNestingHook();
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();

  const selectedTag = useSelector(state => state.project.selectedTag);

  const renderCheckboxes = () => {
    return (
      <ListItem.CheckBox
        checked={selectedTag.spots && selectedTag.spots.includes(props.spot.properties.id)}
        onPress={() => useTags.addRemoveSpotFromTag(props.spot.properties.id, selectedTag)}
      />
    );
  };

  const renderSpotDataIcons = () => (
    <FlatList
      listKey={new Date().toISOString()}
      keyExtractor={(item, index) => index.toString()}
      data={useSpots.getPopulatedPagesKeys(props.spot)}
      horizontal={false}
      numColumns={5}
      renderItem={({item}) => (
        <Avatar
          source={useSpots.getSpotDataIconSource(item)}
          placeholderStyle={{backgroundColor: 'transparent'}}
          size={20}
        />
      )}
    />
  );

  const renderSubspots = () => {
    const children = useNesting.getChildrenGenerationsSpots(props.spot, 10);
    const numSubspots = children.flat().length;
    return <ListItem.Subtitle>[{numSubspots} subspot{numSubspots !== 1 && 's'}]</ListItem.Subtitle>;
  };

  const renderTags = () => {
    const tags = useTags.getTagsAtSpot(props.spot.properties.id);
    const tagsString = tags.map(tag => tag.name).sort().join(', ');
    return !isEmpty(tagsString) && <ListItem.Subtitle>{tagsString}</ListItem.Subtitle>;
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      keyExtractor={(item, index) => item?.properties?.id?.toString() || index.toString()}
      onPress={() => props.onPress(props.spot)}
    >
      <Avatar source={useSpots.getSpotGemometryIconSource(props.spot)}
              placeholderStyle={{backgroundColor: 'transparent'}}
              size={20}
      />
      <ListItem.Content>
        <ListItem.Title style={commonStyles.listItemTitle}>{props?.spot?.properties?.name}</ListItem.Title>
        {props.doShowTags && props.spot && renderTags()}
        {props.doShowSubspots && props.spot && renderSubspots()}
      </ListItem.Content>
      {props.isCheckedList ? renderCheckboxes() : (
        <React.Fragment>
          {props.spot && renderSpotDataIcons()}
          {props.spot && <ListItem.Chevron/>}
        </React.Fragment>
      )}
    </ListItem>
  );
};

export default SpotsListItem;
