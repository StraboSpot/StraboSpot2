import React from 'react';
import {FlatList} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import useNestingHook from '../nesting/useNesting';
import {useTagsHook} from '../tags';
import useSpotsHook from './useSpots';

const SpotsListItem = (props) => {
  const [useNesting] = useNestingHook();
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();

  const renderSpotDataIcons = () => (
    <FlatList
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
      key={props.spot.properties.id}
      onPress={() => props.onPress(props.spot)}
    >
      <Avatar source={useSpots.getSpotGemometryIconSource(props.spot)}
              placeholderStyle={{backgroundColor: 'transparent'}}
              size={20}
      />
      <ListItem.Content>
        <ListItem.Title style={commonStyles.listItemTitle}>{props.spot.properties.name}</ListItem.Title>
        {props.doShowTags && renderTags()}
        {props.doShowSubspots && renderSubspots()}
      </ListItem.Content>
      {renderSpotDataIcons()}
      <ListItem.Chevron/>
    </ListItem>
  );
};

export default SpotsListItem;
