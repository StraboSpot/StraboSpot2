import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {useTagsHook} from '../tags';

const TagsModal = (props) => {
  const [useTags] = useTagsHook();
  const tags = useSelector(state => state.project.project.tags);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const tagsList = () => {
    let filteredTags = {};
    // if (!isEmpty(tags)) filteredTags = tags.filter(tag => tag.type === tag);

    return (
    <FlatList
      keyExtractor={item => item.id.toString()}
        data={tags}
        renderItem={({item, index}) => renderTag(item, index)}
      />
    );
  };

  const showTagsWithSelectedSpot = (tag) => {
    if (tag && tag.spots) {
      const spotInTag = tag.spots.find(spotId => spotId === selectedSpot.properties.id)
      return spotInTag;
    }
  };

  const renderTag = (tag, i) => {
    return (
        <ListItem
          title={tag.name}
          // titleStyle={{color: 'pink'}}
          rightTitle={useTags.getLabel(tag.type)}
          rightTitleStyle={{}}
          rightContentContainerStyle={{alignItems: 'flex-start'}}
          containerStyle={commonStyles.listItem}
          contentContainerStyle={{maxWidth: 100}}
          bottomDivider={i < tags.length - 1}
          onPress={() => useTags.addRemoveTagFromSpot(tag, selectedSpot.properties.id)}
          checkmark={selectedSpot.properties.id === showTagsWithSelectedSpot(tag)}
        />
    );
  };

  return (
    <React.Fragment>
      {tagsList()}
    </React.Fragment>
  );
};

export default TagsModal;
