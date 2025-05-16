import React from 'react';
import {FlatList} from 'react-native';

import {ListItem} from '@rn-vui/base';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {NotebookPageAvatar, SpotGeometryAvatar} from '../../shared/ui/avatars';
import usePage from '../page/usePage';
import {useTags} from '../tags';

const SpotsListItem = ({doShowTags, isCheckedList, isItemChecked, onChecked, onPress, spot}) => {
  // console.log('Rendering SpotsListItem', spot.properties?.name, spot.properties?.id?.toString(), '...');

  const {addRemoveSpotFromTag, getTagsAtSpot} = useTags();
  const {getPopulatedPagesKeys} = usePage();

  const selectedTag = useSelector(state => state.project.selectedTag);

  const renderCheckboxes = () => {
    return (
      <ListItem.CheckBox
        checked={isItemChecked}
        onPress={() => onChecked ? onChecked(spot.properties.id)
          : addRemoveSpotFromTag(spot.properties.id, selectedTag)}
      />
    );
  };

  const renderSpotDataIcons = () => (
    <FlatList
      data={getPopulatedPagesKeys(spot)}
      horizontal={false}
      keyExtractor={(item, index) => index.toString()}
      listKey={new Date().toISOString()}
      numColumns={5}
      renderItem={({item}) => <NotebookPageAvatar pageKey={item}/>}
    />
  );

  const renderTags = () => {
    const tags = getTagsAtSpot(spot.properties.id);
    const tagsString = tags.map(tag => tag.name).sort().join(', ');
    return !isEmpty(tagsString) && <ListItem.Subtitle>{tagsString}</ListItem.Subtitle>;
  };

  return (
    <ListItem
      containerStyle={commonStyles.listItem}
      keyExtractor={(item, index) => item?.properties?.id?.toString() || index.toString()}
      onPress={() => onPress && onPress(spot)}
    >
      <SpotGeometryAvatar spot={spot}/>
      <ListItem.Content>
        <ListItem.Title style={commonStyles.listItemTitle}>{spot?.properties?.name}</ListItem.Title>
        {doShowTags && spot && renderTags()}
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
