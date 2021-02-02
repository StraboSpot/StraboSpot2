import React, {useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import AddButton from '../../shared/ui/AddButton';
import SaveButton from '../../shared/ui/ButtonRounded';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import modalStyle from '../../shared/ui/modal/modal.style';
import {MODALS} from '../home/home.constants';
import useMapsHook from '../maps/useMaps';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, useTagsHook} from '../tags';

const TagsModal = () => {
  const dispatch = useDispatch();
  const [useMaps] = useMapsHook();
  const [useTags] = useTagsHook();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const selectedSpotsForTagging = useSelector(state => state.spot.intersectedSpotsForTagging);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const tags = useSelector(state => state.project.project.tags) || [];
  const [checkedTagsTemp, setCheckedTagsTemp] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const checkTags = (tag) => {
    const checkedTagsIds = checkedTagsTemp.map(checkedTag => checkedTag.id);
    if (checkedTagsIds.includes(tag.id)) {
      const filteredCheckedTags = checkedTagsTemp.filter(checkedTag => checkedTag.id !== tag.id);
      setCheckedTagsTemp(filteredCheckedTags);
    }
    else setCheckedTagsTemp([...checkedTagsTemp, tag]);
  };

  const closeTagDetailModal = () => {
    setIsDetailModalVisible(false);
    dispatch(addedTagToSelectedSpot(false));
  };

  const save = async () => {
    if (modalVisible !== (MODALS.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS)) {
      useMaps.setPointAtCurrentLocation().then(spot => {
        checkedTagsTemp.map(tag => {
          useTags.addRemoveTagFromSpot(tag, spot);
        });
      });
    }
    else {
      let tagsToUpdate = [];
      checkedTagsTemp.map(tag => {
        let spotsListForTagging = [];
        selectedSpotsForTagging.map(spot => {
          if (!useTags.tagSpotExists(tag, spot)) spotsListForTagging.push(spot.properties.id);
        });
        let tagCopy = JSON.parse(JSON.stringify(tag));
        tagCopy.spots = tagCopy.spots.concat(spotsListForTagging);
        tagsToUpdate.push(tagCopy);
      });
      useTags.saveTag(tagsToUpdate);
    }
    else checkedTagsTemp.map(tag => selectedSpotsForTagging.map(spot => useTags.addTagToSpot(tag, spot)));
  };

  const renderSpotTagsList = () => {
    const tagsCopy = JSON.parse(JSON.stringify(tags));
    return (
      <FlatList
        keyExtractor={item => item.id.toString()}
        data={tagsCopy}  // alphabetize by name
        renderItem={({item}) => renderTagItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    );
  };

  const renderTagItem = (tag) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={tag.id}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{tag.name}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{useTags.getLabel(tag.type)}</ListItem.Title>
        </ListItem.Content>
        <ListItem.CheckBox
          checked={(modalVisible && modalVisible !== MODALS.SHORTCUT_MODALS.TAGS
            && modalVisible !== MODALS.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS)
            ? tag && tag.spots && tag.spots.includes(selectedSpot.properties.id)
            : checkedTagsTemp.map(checkedTag => checkedTag.id).includes(tag.id)}
          onPress={() => (modalVisible !== MODALS.SHORTCUT_MODALS.TAGS
            && modalVisible !== MODALS.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS)
            ? useTags.addRemoveTagFromSpot(tag)
            : checkTags(tag)}
        />
      </ListItem>
    );
  };

  return (
    <React.Fragment>
      {/*<ListItem*/}
      {/*  title={'Filter Tags by Type'}*/}
      {/*  // containerStyle={{paddingTop: 20}}*/}
      {/*  bottomDivider*/}
      {/*  topDivider*/}
      {/*  chevron*/}
      {/*/>*/}
      <View style={modalStyle.textContainer}>
        {tags && !isEmpty(tags) ? <Text style={modalStyle.textStyle}>Check all tags that apply</Text>
          : <Text style={modalStyle.textStyle}>No Tags</Text>}
      </View>
      <View style={{maxHeight: 300}}>
        {renderSpotTagsList()}
        {(modalVisible === MODALS.SHORTCUT_MODALS.TAGS || modalVisible === MODALS.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS)
        && !isEmpty(tags) ? (
            <SaveButton
              buttonStyle={{backgroundColor: 'red'}}
              title={'Save tag(s)'}
              onPress={() => save()}
              disabled={isEmpty(checkedTagsTemp)}
            />
          )
          : modalVisible === MODALS.SHORTCUT_MODALS.TAGS && (
          <View style={modalStyle.textContainer}>
            <Text style={{padding: 10, textAlign: 'center'}}>Please add a tag.</Text>
            <AddButton
              title={'Add New Tag'}
              type={'outline'}
              onPress={() => setIsDetailModalVisible(true)}
            />
            <TagDetailModal
              isVisible={isDetailModalVisible}
              closeModal={closeTagDetailModal}
            />
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

export default TagsModal;
