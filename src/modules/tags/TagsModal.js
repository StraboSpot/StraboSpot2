import React from 'react';
import {FlatList} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {useTagsHook} from '../tags';

const TagsModal = () => {
  const [useTags] = useTagsHook();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const tags = useSelector(state => state.project.project.tags);

  const renderTagItem = (tag, i) => {
    return (
      <ListItem
        title={tag.name}
        rightTitle={useTags.getLabel(tag.type)}
        rightTitleStyle={{}}
        rightContentContainerStyle={{alignItems: 'flex-start'}}
        containerStyle={commonStyles.listItem}
        contentContainerStyle={{maxWidth: 100}}
        bottomDivider={i < tags.length - 1}
        onPress={() => useTags.addRemoveTagFromSpot(tag)}
        checkmark={tag && tag.spots && tag.spots.includes(selectedSpot.properties.id)}
      />
    );
  };

  return (
    <React.Fragment>
      <FlatList
        keyExtractor={item => item.id.toString()}
        data={tags.sort((a, b) => a.name.localeCompare(b.name))}  // alphabetize by name
        renderItem={({item, index}) => renderTagItem(item, index)}
      />
    </React.Fragment>
  );
};

export default TagsModal;
