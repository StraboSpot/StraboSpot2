import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import DefaultCheckBox from '../../shared/ui/Checkbox';
import modalStyle from '../../shared/ui/modal/modal.style';
import {Modals} from '../home/home.constants';
import {useTagsHook} from '../tags';

const TagsModal = () => {
  const [useTags] = useTagsHook();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const tags = useSelector(state => state.project.project.tags) || [];

  const renderTagContent = () => {
    return (
      <React.Fragment>
        <ListItem
          title={'Filter Tags by Type'}
          // containerStyle={{paddingTop: 20}}
          bottomDivider
          topDivider
          chevron
        />
        <View style={modalStyle.textContainer}>
          <Text style={modalStyle.textStyle}>Check all tags that apply</Text>
        </View>
        <View style={{maxHeight: 300}}>
          {renderSpotTagsList()}
        </View>
      </React.Fragment>
    );
  };

  const renderSpotTagsList = () => {
    return (
      <FlatList
        keyExtractor={item => item.id.toString()}
        data={tags.sort((a, b) => a.name.localeCompare(b.name))}  // alphabetize by name
        renderItem={({item, index}) => renderTagItem(item, index)}
      />
    );
  };

  const renderTagShortcutContent = () => {
    return (
      <View>
        <Text>BLAH BLAH BLAH</Text>
      </View>
    );
  };

  const renderTagItem = (tag, i) => {
    return (
      <ListItem
        title={tag.name}
        titleStyle={{fontWeight: 'bold'}}
        rightElement={
          <DefaultCheckBox
            iconRight
            onPress={() => useTags.addRemoveTagFromSpot(tag)}
            checkedColor={'grey'}
            checked={tag && tag.spots && tag.spots.includes(selectedSpot.properties.id)}/>
        }
        subtitle={'- ' + useTags.getLabel(tag.type)}
        bottomDivider={i < tags.length - 1}
        // onPress={() => useTags.addRemoveTagFromSpot(tag)}
        // checkmark={!isEmpty(selectedSpot) && tag && tag.spots && tag.spots.includes(selectedSpot.properties.id)}
      />
    );
  };

  return (
    <React.Fragment>
      {modalVisible === Modals.SHORTCUT_MODALS.TAGS && renderTagShortcutContent()}
      {!isEmpty(selectedSpot) && renderTagContent()}
    </React.Fragment>
  );
};

export default TagsModal;
