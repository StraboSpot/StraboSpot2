import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {Button, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import DefaultCheckBox from '../../shared/ui/Checkbox';
import modalStyle from '../../shared/ui/modal/modal.style';
import {useTagsHook} from '../tags';

const TagsModal = () => {
  const [useTags] = useTagsHook();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const tags = useSelector(state => state.project.project.tags);

  const renderTagItem = (tag, i) => {
    return (
      <ListItem
        title={tag.name}
        titleStyle={{fontWeight: 'bold'}}
        rightElement={
            <DefaultCheckBox
              iconRight
              checkedColor={'grey'}
              checked={tag && tag.spots && tag.spots.includes(selectedSpot.properties.id)}/>
          }
        subtitle={'- ' + useTags.getLabel(tag.type)}
        bottomDivider={i < tags.length - 1}
        onPress={() => useTags.addRemoveTagFromSpot(tag)}
        // checkmark={!isEmpty(selectedSpot) && tag && tag.spots && tag.spots.includes(selectedSpot.properties.id)}
      />
    );
  };

  return (
    <React.Fragment>
      <ListItem
        title={'Filter Tags by Type'}
        chevron
      />
      <View style={modalStyle.textContainer}>
        <Text style={modalStyle.textStyle}>Check all tags that apply</Text>
      </View>
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={tags.sort((a, b) => a.name.localeCompare(b.name))}  // alphabetize by name
          renderItem={({item, index}) => renderTagItem(item, index)}
        />
    </React.Fragment>
  );
};

export default TagsModal;
