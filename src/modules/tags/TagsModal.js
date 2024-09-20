import React, {useRef, useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {Field, Formik} from 'formik';
import {ListItem} from 'react-native-elements';
import {useToast} from 'react-native-toast-notifications';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import AddButton from '../../shared/ui/AddButton';
import SaveButton from '../../shared/ui/ButtonRounded';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import modalStyle from '../../shared/ui/modal/modal.style';
import {SelectInputField} from '../form';
import {setLoadingStatus, setModalVisible} from '../home/home.slice';
import useMapLocationHook from '../maps/useMapLocation';
import {MODAL_KEYS, PAGE_KEYS} from '../page/page.constants';
import {TAG_TYPES} from '../project/project.constants';
import {addedTagToSelectedSpot, setSelectedTag} from '../project/projects.slice';
import {TagDetailModal, useTags} from '../tags';

const TagsModal = ({
                     isFeatureLevelTagging,
                     zoomToCurrentLocation,
                   }) => {
  const toast = useToast();
  const {addRemoveTag, addSpotsToTags, filterTagsByTagType, getTagLabel, saveTag} = useTags();
  const useMapLocation = useMapLocationHook();

  const dispatch = useDispatch();
  const isMultipleFeaturesTaggingEnabled = useSelector(state => state.project.isMultipleFeaturesTaggingEnabled);
  const modalVisible = useSelector(state => state.home.modalVisible);
  const pagesStack = useSelector(state => state.notebook.visibleNotebookPagesStack);
  const selectedFeature = useSelector(state => state.spot.selectedAttributes[0]);
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const selectedSpotFeaturesForTagging = useSelector(state => state.spot.selectedAttributes) || [];
  const selectedSpotsForTagging = useSelector(state => state.spot.intersectedSpotsForTagging);
  const tags = useSelector(state => state.project.project?.tags) || [];

  const formRef = useRef(null);

  const [checkedTagsTemp, setCheckedTagsTemp] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const pageVisible = pagesStack.slice(-1)[0];

  const addTag = () => {
    dispatch(setSelectedTag({}));
    setIsDetailModalVisible(true);
  };

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
    return pageVisible === PAGE_KEYS.GEOLOGIC_UNITS || modalVisible === MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS
      ? searchTagsByType(PAGE_KEYS.GEOLOGIC_UNITS)
      : isEmpty(searchText) ? JSON.parse(JSON.stringify(tags.filter(t => t.type !== PAGE_KEYS.GEOLOGIC_UNITS)))
        : searchTagsByType(searchText);
  };

  const save = async () => {
    try {
      dispatch(setLoadingStatus({view: 'home', bool: true}));
      let tagsToUpdate = [];
      if (modalVisible === MODAL_KEYS.SHORTCUTS.TAG || modalVisible === MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS) {
        useMapLocation.setPointAtCurrentLocation().then((spot) => {
          checkedTagsTemp.map((tag) => {
            if (isEmpty(tag.spots)) tag.spots = [];
            tag.spots.push(spot.properties.id);
            tagsToUpdate.push(tag);
          });
          saveTag(tagsToUpdate);
          zoomToCurrentLocation();
        });
      }
      else addSpotsToTags(checkedTagsTemp, selectedSpotsForTagging);
      dispatch(setModalVisible({modal: null}));
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toast.show('Tags Saved!', {type: 'success'});
    }
    catch (err) {
      console.error('Error saving Tag', err);
      dispatch(setLoadingStatus({view: 'home', bool: false}));
      toast.show('Tags Saved Error!', {type: 'danger'});
    }
  };

  const renderSpotTagsList = () => {
    return (
      <>
        {!isEmpty(tags) && pageVisible !== PAGE_KEYS.GEOLOGIC_UNITS
          && modalVisible !== MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS && (
            <Formik
              initialValues={{}}
              validate={fieldValues => setSearchText(fieldValues.searchText)}
              onSubmit={values => console.log('Submitting form...', values)}
              innerRef={formRef}
            >
              {() => (
                <ListItem containerStyle={commonStyles.listItemFormField}>
                  <ListItem.Content>
                    <Field
                      component={formProps => (
                        SelectInputField(
                          {setFieldValue: formProps.form.setFieldValue, ...formProps.field, ...formProps})
                      )}
                      name={'searchText'}
                      key={'searchText'}
                      label={'Tag Type'}
                      choices={TAG_TYPES.filter(t => t !== PAGE_KEYS.GEOLOGIC_UNITS).map(
                        tagType => ({label: getTagLabel(tagType), value: tagType}))}
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
      </>
    );
  };

  const renderTagItem = (tag) => {
    let isAlreadyChecked = false;
    if (isMultipleFeaturesTaggingEnabled) {
      isAlreadyChecked = tag.features && tag.features[selectedSpot.properties.id] && !isEmpty(
          selectedSpotFeaturesForTagging)
        && selectedSpotFeaturesForTagging.every(
          element => tag.features[selectedSpot.properties.id].includes(element.id));
    }
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={tag.id}
        onPress={() => (modalVisible !== MODAL_KEYS.SHORTCUTS.TAG
          && modalVisible !== MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS
          && modalVisible !== MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS) ? addRemoveTag(tag, selectedSpot) : checkTags(tag)}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{tag.name}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{getTagLabel(tag.type)}</ListItem.Title>
        </ListItem.Content>
        {(!isFeatureLevelTagging) && (
          <ListItem.CheckBox
            checked={(modalVisible && modalVisible !== MODAL_KEYS.SHORTCUTS.TAG
              && modalVisible !== MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS
              && modalVisible !== MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS)
              ? tag && tag.spots && tag.spots.includes(selectedSpot.properties.id)
              : checkedTagsTemp.map(checkedTag => checkedTag.id).includes(tag.id)}
            onPress={() => (modalVisible !== MODAL_KEYS.SHORTCUTS.TAG
              && modalVisible !== MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS
              && modalVisible !== MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS) ? addRemoveTag(tag, selectedSpot)
              : checkTags(tag)}
          />
        )}
        {(isFeatureLevelTagging) && (
          <ListItem.CheckBox
            checked={!isMultipleFeaturesTaggingEnabled
              ? tag.features && tag.features[selectedSpot.properties.id] && selectedFeature
              && tag.features[selectedSpot.properties.id].includes(selectedFeature.id) : isAlreadyChecked
            }
            onPress={() => !isMultipleFeaturesTaggingEnabled
              ? addRemoveTag(tag, selectedSpot, isFeatureLevelTagging)
              : addRemoveTag(tag, selectedSpot, isFeatureLevelTagging, isAlreadyChecked)}
          />
        )}
      </ListItem>
    );
  };

  const searchTagsByType = (tagType) => {
    const tagsCopy = JSON.parse(JSON.stringify(tags));
    return filterTagsByTagType(tagsCopy, tagType);
  };

  return (
    <>
      {modalVisible !== MODAL_KEYS.NOTEBOOK.TAGS && modalVisible !== MODAL_KEYS.OTHER.FEATURE_TAGS && (
        <View style={modalStyle.textContainer}>
          <AddButton
            title={'Create New Tag'}
            type={'outline'}
            onPress={addTag}
          />

        </View>
      )}
      <View style={modalStyle.textContainer}>
        {tags && !isEmpty(tags) ? <Text style={modalStyle.textStyle}>Check all tags that apply</Text>
          : <Text style={modalStyle.textStyle}>No Tags</Text>}
      </View>
      {renderSpotTagsList()}
      {(!isEmpty(tags) && modalVisible !== MODAL_KEYS.NOTEBOOK.TAGS && modalVisible !== MODAL_KEYS.OTHER.FEATURE_TAGS)
        && (
          <SaveButton
            buttonStyle={{backgroundColor: 'red'}}
            title={'Save tag(s)'}
            onPress={() => save()}
            disabled={isEmpty(checkedTagsTemp)}
          />
        )}
      <TagDetailModal
        isVisible={isDetailModalVisible}
        closeModal={closeTagDetailModal}
        type={modalVisible === MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS && PAGE_KEYS.GEOLOGIC_UNITS}
      />
    </>
  );
};

export default TagsModal;
