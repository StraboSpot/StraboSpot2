import React, {useRef, useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import AddButton from '../../shared/ui/AddButton';
import SaveButton from '../../shared/ui/ButtonRounded';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import modalStyle from '../../shared/ui/modal/modal.style';
import {SelectInputField} from '../form';
import {MODALS} from '../home/home.constants';
import useMapsHook from '../maps/useMaps';
import {TAG_TYPES} from '../project/project.constants';
import {addedTagToSelectedSpot} from '../project/projects.slice';
import {TagDetailModal, useTagsHook} from '../tags';

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
  const [searchText, setSearchText] = useState('');
  const formRef = useRef(null);

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

  const getRelevantTags = () => {
    if (isEmpty(searchText)) {
      return JSON.parse(JSON.stringify(tags));
    }
    else {
      return searchTagsByType(searchText);
    }
  };

  const save = async () => {
    let tagsToUpdate = [];
    if (modalVisible === (MODALS.SHORTCUT_MODALS.TAGS)) {
      useMaps.setPointAtCurrentLocation().then(spot => {
        checkedTagsTemp.map(tag => {
          if (isEmpty(tag.spots)) tag.spots = [];
          tag.spots.push(spot.properties.id);
          tagsToUpdate.push(tag);
        });
        useTags.saveTag(tagsToUpdate);
      });
    }
    else useTags.addSpotsToTags(checkedTagsTemp, selectedSpotsForTagging);
    if (props.close) props.close();
  };

  const renderSpotTagsList = () => {
    return (
      <React.Fragment>
        {!isEmpty(tags) && (
          <Formik
            initialValues={{}}
            validate={(fieldValues) => setSearchText(fieldValues.searchText)}
            onSubmit={(values) => console.log('Submitting form...', values)}
            innerRef={formRef}
          >
            {() => (
              <ListItem containerStyle={commonStyles.listItemFormField}>
                <ListItem.Content>
                  <Field
                    component={(formProps) => (
                      SelectInputField({setFieldValue: formProps.form.setFieldValue, ...formProps.field, ...formProps})
                    )}
                    name={'searchText'}
                    key={'searchText'}
                    label={'Tag Type'}
                    choices={TAG_TYPES.map(tagType => ({label: useTags.getLabel(tagType), value: tagType}))}
                    single={true}
                  />
                </ListItem.Content>
              </ListItem>
            )}
          </Formik>
        )}
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={getRelevantTags().sort((tagA, tagB) => tagA.name.localeCompare(tagB.name))}  // alphabetize by name
          renderItem={({item}) => renderTagItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText
            text={!isEmpty(tags) && isEmpty(getRelevantTags()) ? 'There are no tags with this type.' : ''}/>}
        />
      </React.Fragment>
    );
  };

  const renderTagItem = (tag) => {
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={tag.id}
        onPress={() => (modalVisible !== MODALS.SHORTCUT_MODALS.TAGS
          && modalVisible !== MODALS.SHORTCUT_MODALS.ADD_TAGS_TO_SPOTS)
          ? useTags.addRemoveTagFromSpot(tag)
          : checkTags(tag)}
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

  const searchTagsByType = (tagType) => {
    const tagsCopy = JSON.parse(JSON.stringify(tags));
    return useTags.filterTagsByTagType(tagsCopy, tagType);
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
      <View style={{maxHeight: 500, paddingBottom: 10}}>
        {modalVisible !== MODALS.NOTEBOOK_MODALS.TAGS && (
          <View style={modalStyle.textContainer}>
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
        <View style={modalStyle.textContainer}>
          {tags && !isEmpty(tags) ? <Text style={modalStyle.textStyle}>Check all tags that apply</Text>
            : <Text style={modalStyle.textStyle}>No Tags</Text>}
        </View>
        {renderSpotTagsList()}
        {!isEmpty(tags) && modalVisible !== MODALS.NOTEBOOK_MODALS.TAGS && (
          <SaveButton
            buttonStyle={{backgroundColor: 'red'}}
            title={'Save tag(s)'}
            onPress={() => save()}
            disabled={isEmpty(checkedTagsTemp)}
          />
        )}
      </View>
    </React.Fragment>
  );
};

export default TagsModal;
