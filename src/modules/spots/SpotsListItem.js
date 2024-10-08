import React from 'react';
import {FlatList, View} from 'react-native';

import {Avatar, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import useSpotsHook from './useSpots';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import usePageHook from '../page/usePage';
import {useTagsHook} from '../tags';

const SpotsListItem = ({
                         doShowTags,
                         isCheckedList,
                         numSubspots,
                         onPress,
                         spot,
                       }) => {
  // console.log('Rendering SpotsListItem', spot.properties?.name, spot.properties?.id?.toString(), '...');

  const useSpots = useSpotsHook();
  const useTags = useTagsHook();
  const usePage = usePageHook();

  const selectedTag = useSelector(state => state.project.selectedTag);

  const renderCheckboxes = () => {
    return (
      <ListItem.CheckBox
        checked={selectedTag.spots && selectedTag.spots.includes(spot.properties.id)}
        onPress={() => useTags.addRemoveSpotFromTag(spot.properties.id, selectedTag)}
      />
    );
  };

  const renderSpotDataIcons = () => (
    <View>
      <FlatList
        data={usePage.getPopulatedPagesKeys(spot)}
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
    return <ListItem.Subtitle>[{numSubspots} subspot{numSubspots !== 1 && 's'}]</ListItem.Subtitle>;
  };

  const renderTags = () => {
    const tags = useTags.getTagsAtSpot(spot.properties.id);
    const tagsString = tags.map(tag => tag.name).sort().join(', ');
    return !isEmpty(tagsString) && <ListItem.Subtitle>{tagsString}</ListItem.Subtitle>;
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      keyExtractor={(item, index) => item?.properties?.id?.toString() || index.toString()}
      onPress={() => onPress(spot)}
    >
      <Avatar
        placeholderStyle={{backgroundColor: 'transparent'}}
        size={20}
        source={useSpots.getSpotGeometryIconSource(spot)}
      />
      <ListItem.Content>
        <ListItem.Title style={commonStyles.listItemTitle}>{spot?.properties?.name}</ListItem.Title>
        {doShowTags && spot && renderTags()}
        {!isEmpty(numSubspots) && spot && renderSubspots()}
      </ListItem.Content>
      {isCheckedList ? renderCheckboxes() : (
        <>
          {spot && renderSpotDataIcons()}
          {spot && <ListItem.Chevron/>}
        </>
      )}
    </ListItem>
  );
};

export default SpotsListItem;
