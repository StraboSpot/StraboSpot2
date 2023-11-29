import React from 'react';
import {FlatList, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import useNestingHook from '../nesting/useNesting';
import usePageHoook from '../page/usePage';
import {useTagsHook} from '../tags';
import useSpotsHook from './useSpots';

const SpotsListItem = (props) => {
  console.log('Rendering SpotsListItem', props.spot.properties?.name, props.spot.properties?.id?.toString(), '...');

  const [useNesting] = useNestingHook();
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();
  const usePage = usePageHoook();

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
    <View>
      <FlatList
        data={usePage.getPopulatedPagesKeys(props.spot)}
        horizontal={false}
        keyExtractor={(item, index) => index.toString()}
        listKey={new Date().toISOString()}
        numColumns={5}
        renderItem={({item}) => (
          <Avatar
            source={usePage.getSpotDataIconSource(item)}
            placeholderStyle={{backgroundColor: 'transparent'}}
            size={20}
          />
        )}
      />
    </View>
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
      <Avatar
        placeholderStyle={{backgroundColor: 'transparent'}}
        size={20}
        source={useSpots.getSpotGemometryIconSource(props.spot)}
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
