import React, {useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import AddButton from '../../shared/ui/AddButton';
import SaveButton from '../../shared/ui/ButtonRounded';
import DefaultCheckBox from '../../shared/ui/Checkbox';
import modalStyle from '../../shared/ui/modal/modal.style';
import {Modals} from '../home/home.constants';
import useMapsHook from '../maps/useMaps';
import {projectReducers} from '../project/project.constants';
import {useTagsHook, TagDetailModal} from '../tags';
import tagStyles from './tags.styles';

const TagsModal = (props) => {
  const dispatch = useDispatch();
  const [useMaps] = useMapsHook();
  const [useTags] = useTagsHook();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const selectedSpotsForTagging = useSelector(state => state.spot.intersectedSpotsForTagging);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const tags = useSelector(state => state.project.project.tags) || [];
  const [checkedTagsTemp, setCheckedTagsTemp] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const addTag = async () => {
    await useTags.addTag();
    setIsDetailModalVisible(true);
  };

  const closeTagDetailModal = () => {
    setIsDetailModalVisible(false);
    dispatch({type: projectReducers.ADD_TAG_TO_SELECTED_SPOT, addTagToSelectedSpot: false});
  };


  const checkTags = (tag) => {
    const checkedTagsIds = checkedTagsTemp.map(checkedTag => checkedTag.id);
    if (checkedTagsIds.includes(tag.id)) {
      const filteredCheckedTags = checkedTagsTemp.filter(checkedTag => checkedTag.id !== tag.id);
      setCheckedTagsTemp(filteredCheckedTags);
    }
    else setCheckedTagsTemp([...checkedTagsTemp, tag]);
  };

  const save = async () => {
    if (modalVisible !== (Modals.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS)) {
      useMaps.setPointAtCurrentLocation().then(spot => {
        checkedTagsTemp.map(tag => {
          useTags.addRemoveTagFromSpot(tag, spot);
        });
      });
    }
    else {
      checkedTagsTemp.map(tag => {
        selectedSpotsForTagging.map(spot => {
          useTags.addTagToSpot(tag, spot);
        });
      });
    }
  };

  const renderTagContent = () => {
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
          {tags && !isEmpty(tags)
            ? <Text style={modalStyle.textStyle}>Check all tags that apply</Text>
            : <Text style={modalStyle.textStyle}>No Tags</Text>}
        </View>
        <View style={{maxHeight: 300}}>
          {renderSpotTagsList()}
          {(modalVisible === Modals.SHORTCUT_MODALS.TAGS || modalVisible === Modals.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS)
          && <SaveButton
            buttonStyle={{backgroundColor: 'red'}}
            title={'Save tag(s)'}
            onPress={() => save()} disabled={isEmpty(checkedTagsTemp)}
          />}
        </View>
      </React.Fragment>
    );
  };

  const renderSpotTagsList = () => {
    const tagsCopy = JSON.parse(JSON.stringify(tags))
    return (
      <FlatList
        keyExtractor={item => item.id.toString()}
        data={tagsCopy}  // alphabetize by name
        renderItem={({item, index}) => renderTagItem(item, index)}
      />
    );
  };

  const renderTagItem = (tag, i) => {
    return (
      <ListItem key={tag.id} bottomDivider={i < tags.length - 1}>
        <ListItem.Content>
          <ListItem.Title style={{fontWeight: 'bold'}}>{tag.name}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Content>
          <ListItem.Title style={tagStyles.listText}>{useTags.getLabel(tag.type)}</ListItem.Title>
        </ListItem.Content>
        <DefaultCheckBox
          onPress={() => (modalVisible !== Modals.SHORTCUT_MODALS.TAGS) && (modalVisible !== Modals.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS)
            ? useTags.addRemoveTagFromSpot(tag)
            : checkTags(tag)}
          checkedColor={'grey'}
          checked={(modalVisible && modalVisible !== Modals.SHORTCUT_MODALS.TAGS) && (modalVisible !== Modals.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS)
            ? tag && tag.spots && tag.spots.includes(selectedSpot.properties.id)
            : checkedTagsTemp.map(checkedTag => checkedTag.id).includes(tag.id)}
        />
      </ListItem>
    );
  };

  return (
    <View>
      {(modalVisible === Modals.SHORTCUT_MODALS.TAGS || modalVisible === Modals.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS) && <AddButton
        title={'Create New Tag'}
        onPress={() => addTag()}
      />}
      {renderTagContent()}
      <TagDetailModal
        isVisible={isDetailModalVisible}
        closeModal={closeTagDetailModal}
      />
    </View>
  );
};

export default TagsModal;
